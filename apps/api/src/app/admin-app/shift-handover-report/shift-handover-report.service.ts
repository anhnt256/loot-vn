import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GatewayPrismaService, TenantPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { CreateShiftReportDto } from './dto/create-shift-report.dto';
import { FilterShiftReportDto } from './dto/filter-shift-report.dto';
import { dayjs } from '@gateway-workspace/shared/utils';
import { getMomoStatisticsByShift, loginAndGetMomoToken } from '../../lib/momo-report';
import { computePaymentTotals, getShiftApiDateParam } from '../../lib/ffood-shift-verify';
import { loginAndGetToken as loginAndGetFfoodToken } from '../../lib/ffood-login';
import { getFnetDB } from '../../lib/db';

@Injectable()
export class ShiftHandoverReportService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService
  ) {}

  private async getGatewayClient(tenantId: string) {
    let tenant = await this.tenantPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.tenantPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    return await this.gatewayPrisma.getClient(dbUrl);
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
      const tenant = await this.tenantPrisma.tenant.findUnique({ where: { id: tenantId, deletedAt: null } })
        || await this.tenantPrisma.tenant.findFirst({ where: { tenantId: tenantId, deletedAt: null } });
      if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

      const gatewayClient = await this.getGatewayClient(tenantId);
      const shift = await gatewayClient.workShift.findUnique({ where: { id: workShiftId } });
      if (!shift) throw new BadRequestException('Ca trực không tồn tại');
      
      let fnetRevenue = 0;
      let totalFood = 0;
      let deduction = 0;
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

      // 2. FFOOD Revenue
      try {
        const ffoodCred = await gatewayClient.ffoodCredential.findFirst();
        console.log('[Autofill] Ffood Cred:', ffoodCred ? 'Found' : 'Not found');
        if (ffoodCred && ffoodCred.shopId) {
          let token = ffoodCred.token;
          const isExpired = !token || !ffoodCred.expired || new Date(ffoodCred.expired) <= new Date();
          console.log(`[Autofill] Ffood Token expired? ${isExpired}`);

          if (isExpired && ffoodCred.ffoodUrl && ffoodCred.username && ffoodCred.password) {
            console.log('[Autofill] Refreshing Ffood token via Playwright...');
            const loginRes = await loginAndGetFfoodToken(ffoodCred.ffoodUrl, ffoodCred.username, ffoodCred.password);
            if (loginRes) {
              token = loginRes.token;
              await gatewayClient.ffoodCredential.update({
                where: { id: ffoodCred.id },
                data: { token, expired: loginRes.expired }
              });
              console.log('[Autofill] Ffood login success');
            } else {
              console.warn('[Autofill] Ffood login failed');
            }
          }

          if (token) {
            const apiDateParam = getShiftApiDateParam(dateStr);
            const url = `https://pos-api.ffood.com.vn/api/v1/shift?date=${encodeURIComponent(apiDateParam)}&shopId=${encodeURIComponent(ffoodCred.shopId.trim())}`;
            console.log(`[Autofill] Ffood URL: ${url}`);
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token.trim()}` } });
            if (res.ok) {
              const json = await res.json() as any;
              const rawShifts = Array.isArray(json?.data) ? json.data : [];
              console.log(`[Autofill] Ffood raw shifts count: ${rawShifts.length}`);
              
              // Filter shifts by employee ID AND date
              const employeeId = shift.ffoodId?.trim();
              const filteredShifts = rawShifts.filter((item: any) => {
                const sameId = item.employee?.id?.trim() === employeeId;
                const shiftDate = item.checkInTime ? dayjs(item.checkInTime).format('YYYY-MM-DD') : null;
                const sameDate = shiftDate === dateStr;
                return sameId && sameDate;
              });

              console.log(`[Autofill] Ffood candidate shifts for ${employeeId} on ${dateStr}: ${filteredShifts.length}`);
              filteredShifts.forEach((s: any) => {
                const { totalFood: sFood, deduction: sDeduct } = computePaymentTotals(s.payments);
                console.log(`[Autofill] Candidate Shift ${s.id}: in=${s.checkInTime}, out=${s.checkOutTime}, food=${sFood}, deduct=${sDeduct}, payments=${JSON.stringify(s.payments)}`);
              });

              if (filteredShifts.length > 0) {
                // If multiple shifts for same employee on same day, pick the one closest to shift startTime
                let bestShift = filteredShifts[0];
                if (filteredShifts.length > 1) {
                   const shiftStart = dayjs(`${dateStr}T${dayjs(shift.startTime).format('HH:mm:ss')}`);
                   let minDiff = Infinity;
                   for (const s of filteredShifts) {
                     const checkIn = dayjs(s.checkInTime);
                     const diff = Math.abs(checkIn.diff(shiftStart, 'minute'));
                     if (diff < minDiff) {
                       minDiff = diff;
                       bestShift = s;
                     }
                   }
                   console.log(`[Autofill] Multiple shifts found. Picked ${bestShift.id} (diff ${minDiff} mins from workShift start)`);
                }

                const totals = computePaymentTotals(bestShift.payments);
                totalFood = totals.totalFood;
                deduction = totals.deduction;
                console.log(`[Autofill] Ffood shift found: id=${bestShift.id}, final food=${totalFood}, final deduct=${deduction}`);
              } else {
                console.warn(`[Autofill] Ffood shift matching ffoodId ${shift.ffoodId} and date ${dateStr} NOT found`);
              }
            } else {
              const errTxt = await res.text();
              console.error(`[Autofill] Ffood API error ${res.status}: ${errTxt}`);
            }
          }
        }
      } catch (e) {
        console.error('[Autofill] Ffood error:', e);
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
            const loginRes = await loginAndGetMomoToken({ username: momoCred.username, password: momoCred.password });
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

          if (token && momoCred.merchant_id && momoCred.store_id) {
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
              merchantId: momoCred.merchant_id.toString(),
              storeId: momoCred.store_id,
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
          gcpRevenue: totalFood - deduction,
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
