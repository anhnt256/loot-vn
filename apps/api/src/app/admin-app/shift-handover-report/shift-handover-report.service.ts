import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { CreateShiftReportDto } from './dto/create-shift-report.dto';
import { FilterShiftReportDto } from './dto/filter-shift-report.dto';
import { dayjs } from '@gateway-workspace/shared/utils';
import { getMomoStatisticsByShift, loginAndGetMomoToken } from '../../lib/momo-report';
import { getFnetDB } from '../../lib/db';
import { decrypt } from '../../lib/crypto';

@Injectable()
export class ShiftHandoverReportService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService
  ) {}

  private async getGatewayClient(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    return await this.tenantPrisma.getClient(dbUrl);
  }

  async getWorkShifts(tenantId: string) {
    const db = await this.getGatewayClient(tenantId);
    return db.workShift.findMany({ orderBy: { startTime: 'asc' } });
  }

  async create(tenantId: string, payload: CreateShiftReportDto) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);

      const targetDate = new Date(`${payload.date}T00:00:00.000Z`);

      // Verify no duplication
      const exist = await gatewayClient.shiftHandoverReport.findFirst({
        where: { date: targetDate, workShiftId: payload.workShiftId }
      });
      if (exist) {
        throw new BadRequestException('Báo cáo kết ca này đã tồn tại!');
      }

      const report = await gatewayClient.shiftHandoverReport.create({
        data: {
          date: targetDate,
          workShiftId: payload.workShiftId,
          fnetRevenue: payload.fnetRevenue,
          gcpRevenue: payload.gcpRevenue,
          momoRevenue: payload.momoRevenue,
          cashRevenue: payload.cashRevenue,
          cashExpense: payload.cashExpense,
          actualReceived: payload.actualReceived,
          note: payload.note,
        },
      });

      return { success: true, data: this.mapWithCalculatedFields(report) };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      console.error(e);
      throw new InternalServerErrorException('Lỗi tạo báo cáo kết ca');
    }
  }

  async getAutofillData(tenantId: string, dateStr: string, workShiftId: number) {
    try {
      const tenant = await this.masterPrisma.tenant.findUnique({ where: { id: tenantId, deletedAt: null } })
        || await this.masterPrisma.tenant.findFirst({ where: { tenantId: tenantId, deletedAt: null } });
      if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

      const gatewayClient = await this.getGatewayClient(tenantId);
      const shift = await gatewayClient.workShift.findUnique({ where: { id: workShiftId } });
      if (!shift) throw new BadRequestException('Ca trực không tồn tại');
      
      let fnetRevenue = 0;
      let gcpRevenue = 0;
      let momoRevenue = 0;

      // 1. FNET Revenue
      if (tenant.fnetUrl && shift.FnetStaffId) {
        try {
          const fnetDB = await getFnetDB(tenant.fnetUrl);
          const sumResult = await fnetDB.$queryRawUnsafe(`SELECT COALESCE(SUM(Amount), 0) AS total FROM fnet.paymenttb WHERE StaffId = ? AND ServeDate = ?`, Number(shift.FnetStaffId), dateStr) as { total: unknown }[];
          fnetRevenue = sumResult[0]?.total != null ? Number(sumResult[0].total) : 0;
          console.log(`[Autofill] Fnet: ${fnetRevenue} for staff ${shift.FnetStaffId} on ${dateStr}`);
        } catch (e) {
          console.error('[Autofill] Fnet error:', e);
        }
      }

      // 2. Doanh thu hoàn thành từ hệ thống đặt món theo staffId
      if (shift.staffId) {
        try {
          const parsedTenantId = parseInt(tenantId) || 1;
          const startOfDay = dayjs(dateStr).utcOffset(7).startOf('day').toDate();
          const endOfDay = dayjs(dateStr).utcOffset(7).endOf('day').toDate();

          // Tìm StaffShift của nhân viên theo staffId trên ngày đó
          const staffShift = await (gatewayClient as any).staffShift.findFirst({
            where: {
              staffId: shift.staffId,
              tenantId: parsedTenantId,
              startedAt: { gte: startOfDay, lte: endOfDay },
            },
            orderBy: { startedAt: 'desc' },
          });

          if (staffShift) {
            const shiftStart = new Date(staffShift.startedAt);
            const shiftEnd = staffShift.endedAt ? new Date(staffShift.endedAt) : endOfDay;

            const revenueAgg = await (gatewayClient as any).foodOrder.aggregate({
              where: {
                tenantId: parsedTenantId,
                status: 'HOAN_THANH',
                createdAt: { gte: shiftStart, lte: shiftEnd },
              },
              _sum: { totalAmount: true },
            });

            gcpRevenue = Number(revenueAgg._sum?.totalAmount ?? 0);
            console.log(`[Autofill] GCP Revenue: ${gcpRevenue} for staffId ${shift.staffId} shift ${staffShift.id} (${staffShift.startedAt} ~ ${staffShift.endedAt ?? 'active'}) on ${dateStr}`);
          } else {
            console.warn(`[Autofill] No StaffShift found for staffId ${shift.staffId} on ${dateStr}`);
          }
        } catch (e) {
          console.error('[Autofill] GCP Revenue error:', e);
        }
      }

      // 3. MOMO Revenue
      try {
        const momoCred = await gatewayClient.momoCredential.findFirst();
        console.log('[Autofill] Momo Cred:', momoCred ? 'Found' : 'Not found');
        if (momoCred) {
          let token = momoCred.token;
          const isExpired = !token || !momoCred.expired || new Date(momoCred.expired) <= new Date();
          console.log(`[Autofill] Momo Token expired? ${isExpired}`);
          
          if (isExpired && momoCred.username && momoCred.password) {
            console.log('[Autofill] Refreshing Momo token...');
            const loginRes = await loginAndGetMomoToken({ username: momoCred.username, password: decrypt(momoCred.password) });
            if (loginRes) {
              token = loginRes.token;
              await gatewayClient.momoCredential.update({
                where: { id: momoCred.id },
                data: { token: loginRes.token, expired: loginRes.expired }
              });
              console.log('[Autofill] Momo login success');
            } else {
              console.warn('[Autofill] Momo login failed');
            }
          }

          if (token && momoCred.merchantId && momoCred.storeId) {
            const shiftObj = {
              id: shift.id,
              name: shift.name,
              startTime: dayjs(shift.startTime).format('HH:mm:ss'),
              endTime: dayjs(shift.endTime).format('HH:mm:ss'),
              isOvernight: shift.isOvernight,
              branch: tenant.tenantId
            };
            console.log(`[Autofill] Momo Shift: ${JSON.stringify(shiftObj)}`);
            const momoStats = await getMomoStatisticsByShift({
              token,
              merchantId: momoCred.merchantId,
              storeId: momoCred.storeId,
              shift: shiftObj as any,
              date: dateStr
            });
            if (momoStats) {
              momoRevenue = momoStats.totalSuccessAmount;
              console.log(`[Autofill] Momo Success amount: ${momoRevenue}`);
            }
          }
        }
      } catch (e) {
        console.error('[Autofill] Momo error:', e);
      }

      return {
        success: true,
        data: {
          fnetRevenue,
          gcpRevenue,
          momoRevenue
        }
      };
    } catch(e) {
      console.error('Failed to get autofill data', e);
      return { success: true, data: { fnetRevenue: 0, gcpRevenue: 0, momoRevenue: 0 } };
    }
  }

  async findAll(tenantId: string, filterDto: FilterShiftReportDto) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      
      const where: any = {};
      
      if (filterDto.filterDate) {
        if (filterDto.filterDate.length === 7) { // YYYY-MM format
          // filter for whole month
          const startOfMonth = new Date(`${filterDto.filterDate}-01T00:00:00.000Z`);
          
          const [yearStr, monthStr] = filterDto.filterDate.split('-');
          const endOfMonth = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10), 0));
          endOfMonth.setUTCHours(23, 59, 59, 999);

          where.date = {
            gte: startOfMonth,
            lte: endOfMonth
          };
        } else {
          // Exact Date
          const targetDate = new Date(`${filterDto.filterDate}T00:00:00.000Z`);
          where.date = targetDate;
        }
      }
      
      if (filterDto.filterShiftId) {
        where.workShiftId = parseInt(filterDto.filterShiftId, 10);
      }

      const reports = await gatewayClient.shiftHandoverReport.findMany({
        where,
        orderBy: [{ date: 'desc' }],
        include: { workShift: { select: { name: true } } },
      });

      return { success: true, data: reports.map(r => this.mapWithCalculatedFields(r)) };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Lỗi tải danh sách báo cáo kết ca');
    }
  }

  private mapWithCalculatedFields(report: any) {
    const sauChi = (report.cashRevenue || 0) - (report.cashExpense || 0);
    const chenhLech = (report.actualReceived || 0) - sauChi;

    return {
      ...report,
      sauChi,
      chenhLech
    };
  }
}
