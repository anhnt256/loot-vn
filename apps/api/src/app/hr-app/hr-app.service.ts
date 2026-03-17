import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService, TenantPrismaService, GatewayPrismaService } from '../database/prisma.service';
import { TenantGatewayService } from '../database/tenant-gateway.service';
import { getTenantDbUrl } from '../database/tenant-gateway.service';
import { dayjs, getCurrentTimeVNISO, getCurrentTimeVNDB, signJWT } from '@gateway-workspace/shared/utils';
import * as crypto from 'crypto';

@Injectable()
export class HrAppService {
  private readonly logger = new Logger(HrAppService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService,
    private readonly tenantGateway: TenantGatewayService,
  ) {}

  async login(userName: string, password?: string, tenantId?: string) {
    this.logger.log(`Login attempt for user: ${userName}, tenantId: ${tenantId}`);
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    // Verify tenant and apikey
    let tenant = await this.tenantPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });

    if (!tenant) {
      // Try to find by slug (tenantId field)
      tenant = await this.tenantPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }

    if (!tenant) {
      this.logger.warn(`Tenant not found for ID or slug: ${tenantId}`);
      throw new UnauthorizedException('Tenant không hợp lệ');
    }

    this.logger.log(`Found tenant: ${tenant.name} (${tenant.id})`);

    const apiKey = await this.tenantPrisma.apiKey.findFirst({
      where: { tenantId: tenant.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!apiKey) {
      this.logger.warn(`Tenant ${tenant.id} has no API key`);
      throw new UnauthorizedException('Tenant chưa cấu hình API key');
    }

    if (apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
      this.logger.warn(`Tenant ${tenant.id} API key expired`);
      throw new UnauthorizedException('Hệ thống đã hết hạn, vui lòng gia hạn để sử dụng');
    }

    if (!userName || !password) {
      throw new BadRequestException('Vui lòng nhập tên đăng nhập và mật khẩu');
    }

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) {
      this.logger.warn(`Tenant ${tenant.id} has no dbUrl configured`);
      throw new BadRequestException('Tenant chưa cấu hình DB URL. Vui lòng cập nhật trong quản lý tenant.');
    }
    const gateway = await this.gatewayPrisma.getClient(dbUrl);

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const staff = (await gateway.$queryRawUnsafe(
      `SELECT id, userName, fullName, staffType, password, isAdmin FROM Staff 
       WHERE userName = ? AND isDeleted = false`,
      userName,
    )) as any[];

    if (staff.length === 0) {
      this.logger.warn(`Staff not found in gateway DB for userName: ${userName}`);
      throw new BadRequestException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const staffData = staff[0];

    // Check reset password logic (optional but good for consistency)
    const resetPasswordHash = crypto.createHash('sha256').update("RESET_PASSWORD_REQUIRED_" + staffData.id).digest('hex');
    if (staffData.password === resetPasswordHash) {
      return { requirePasswordReset: true, staffId: staffData.id };
    }

    if (staffData.password !== hashedPassword) {
      this.logger.warn(`Password mismatch for userName: ${userName}`);
      throw new BadRequestException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    this.logger.log(`Login success for userName: ${userName}`);
    const payload = {
      userId: staffData.id,
      userName: staffData.userName,
      role: 'staff',
      staffType: staffData.isAdmin ? 'SUPER_ADMIN' : staffData.staffType,
    };

    const token = await signJWT(payload);

    return {
      token,
      user: {
        id: staffData.id,
        userName: staffData.userName,
        fullName: staffData.fullName,
        staffType: staffData.isAdmin ? 'SUPER_ADMIN' : staffData.staffType,
      }
    };
  }

  async getMyInfo(userName: string, tenantId: string) {
    if (!userName) {
      throw new BadRequestException('Missing user information');
    }
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);

    const staff = (await gateway.$queryRawUnsafe(
      `SELECT 
        id, fullName, userName, staffType, phone, email,
        address, dateOfBirth, gender, hireDate, idCard,
        idCardExpiryDate, idCardIssueDate, note, resignDate,
        needCheckMacAddress, bankAccountName, bankAccountNumber,
        bankName, baseSalary, createdAt, updatedAt, isAdmin
      FROM Staff 
      WHERE userName = ? AND isDeleted = false
      LIMIT 1`,
      userName,
    )) as any[];

    if (staff.length === 0) {
      throw new NotFoundException('Staff not found');
    }

    const staffData = staff[0];
    if (staffData.isAdmin) {
      staffData.staffType = 'SUPER_ADMIN';
    }

    return staffData;
  }

  async getTimeTracking(params: { staffId: number; month?: string; year?: string; date?: string }, tenantId: string) {
    const { staffId, month, year, date } = params;
    if (!staffId) {
      throw new BadRequestException('staffId is required');
    }
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);

    // Today's records with stats
    if (date) {
      const today = dayjs(getCurrentTimeVNISO()).format('YYYY-MM-DD');
      const startOfWeek = dayjs(getCurrentTimeVNISO()).startOf('week').format('YYYY-MM-DD');
      const endOfWeek = dayjs(getCurrentTimeVNISO()).endOf('week').format('YYYY-MM-DD');
      const startOfMonth = dayjs(getCurrentTimeVNISO()).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dayjs(getCurrentTimeVNISO()).endOf('month').format('YYYY-MM-DD');

      const todayRecords = (await gateway.$queryRawUnsafe(
        `SELECT 
          id, checkInTime, checkOutTime,
          CASE 
            WHEN checkOutTime IS NOT NULL THEN 'COMPLETED'
            ELSE 'WORKING'
          END as status
        FROM StaffTimeTracking 
        WHERE staffId = ? AND DATE(checkInTime) = DATE(?)
        ORDER BY checkInTime DESC`,
        staffId,
        date,
      )) as any[];

      const calculateHours = (records: any[]) => {
        let hours = 0;
        const now = dayjs().utcOffset(7);
        records.forEach((record: any) => {
          const checkIn = dayjs(record.checkInTime);
          let checkOut = record.checkOutTime ? dayjs(record.checkOutTime) : now;
          hours += Math.abs(checkOut.diff(checkIn, 'hour', true));
        });
        return parseFloat(hours.toFixed(2));
      };

      const weekRecords = (await gateway.$queryRawUnsafe(
        `SELECT checkInTime, checkOutTime FROM StaffTimeTracking 
        WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?`,
        staffId, startOfWeek, endOfWeek,
      )) as any[];

      const monthRecords = (await gateway.$queryRawUnsafe(
        `SELECT checkInTime, checkOutTime FROM StaffTimeTracking 
        WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?`,
        staffId, startOfMonth, endOfMonth,
      )) as any[];

      return {
        todayRecords,
        stats: {
          todayHours: calculateHours(todayRecords),
          weekHours: calculateHours(weekRecords),
          monthHours: calculateHours(monthRecords),
        },
      };
    }

    // Monthly history
    let startDate: string;
    let endDate: string;
    if (month && year) {
      startDate = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('YYYY-MM-DD');
      endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
    } else {
      startDate = dayjs(getCurrentTimeVNISO()).startOf('month').format('YYYY-MM-DD');
      endDate = dayjs(getCurrentTimeVNISO()).endOf('month').format('YYYY-MM-DD');
    }

    const todayDate = dayjs(getCurrentTimeVNISO()).format('YYYY-MM-DD');
    const todayRecord = (await gateway.$queryRawUnsafe(
      `SELECT * FROM StaffTimeTracking WHERE staffId = ? AND DATE(checkInTime) = ? ORDER BY checkInTime DESC LIMIT 1`,
      staffId, todayDate,
    )) as any[];

    const rawHistory = (await gateway.$queryRawUnsafe(
      `SELECT id, DATE(checkInTime) as date, checkInTime, checkOutTime,
        CASE WHEN checkOutTime IS NULL THEN 'WORKING' ELSE 'COMPLETED' END as status
      FROM StaffTimeTracking 
      WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?
      ORDER BY checkInTime ASC`,
      staffId, startDate, endDate,
    )) as any[];

    const now = dayjs().utcOffset(7);
    const history = rawHistory.map((record: any) => {
      const checkIn = dayjs(record.checkInTime);
      let checkOut = record.checkOutTime ? dayjs(record.checkOutTime) : now;
      return {
        ...record,
        totalHours: parseFloat(Math.abs(checkOut.diff(checkIn, 'hour', true)).toFixed(2)),
      };
    });

    const monthHours = history.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const todayHours = history
      .filter(r => dayjs(r.date).format('YYYY-MM-DD') === todayDate)
      .reduce((sum, r) => sum + (r.totalHours || 0), 0);

    return {
      todayRecord: todayRecord[0] || null,
      history,
      stats: {
        todayHours: parseFloat(todayHours.toFixed(2)),
        weekHours: 0,
        monthHours: parseFloat(monthHours.toFixed(2)),
      },
    };
  }

  async postTimeTracking(staffId: number, action: string, recordId: number | undefined, tenantId: string) {
    if (!staffId || !action) {
      throw new BadRequestException('staffId and action are required');
    }
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);
    const nowVN = getCurrentTimeVNDB();

    if (action === 'checkin') {
      const existingWorking = (await gateway.$queryRawUnsafe(
        `SELECT id FROM StaffTimeTracking WHERE staffId = ? AND checkOutTime IS NULL LIMIT 1`,
        staffId,
      )) as any[];

      if (existingWorking.length > 0) {
        throw new BadRequestException('Bạn đang có ca làm việc chưa check-out.');
      }

      await gateway.$executeRawUnsafe(
        `INSERT INTO StaffTimeTracking (staffId, checkInTime, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
        staffId, nowVN, nowVN, nowVN,
      );
      return { message: 'Check-in thành công' };
    } else if (action === 'checkout') {
      if (!recordId) throw new BadRequestException('recordId is required for checkout');

      const existing = (await gateway.$queryRawUnsafe(
        `SELECT id FROM StaffTimeTracking WHERE id = ? AND staffId = ? AND checkOutTime IS NULL LIMIT 1`,
        recordId, staffId,
      )) as any[];

      if (existing.length === 0) {
        throw new BadRequestException('Không tìm thấy record check-in hoặc đã checkout');
      }

      await gateway.$executeRawUnsafe(
        `UPDATE StaffTimeTracking SET checkOutTime = ?, updatedAt = ? WHERE id = ?`,
        nowVN, nowVN, recordId,
      );
      return { message: 'Check-out thành công' };
    } else {
      throw new BadRequestException('Invalid action');
    }
  }

  async getSalary(params: { staffId: number; month?: string; year?: string }, tenantId: string) {
    const { staffId, month, year } = params;
    if (!staffId) throw new BadRequestException('staffId is required');
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);

    const m = month ? parseInt(month) : null;
    const y = year ? parseInt(year) : null;

    let salaryQuery = `SELECT ss.* FROM StaffSalary ss 
      LEFT JOIN Staff s ON ss.staffId = s.id
      WHERE ss.staffId = ?`;
    const queryParams: any[] = [staffId];

    if (m && y) {
      salaryQuery += ` AND ss.month = ? AND ss.year = ?`;
      queryParams.push(m, y);
    } else {
      salaryQuery += ` ORDER BY ss.year DESC, ss.month DESC LIMIT 12`;
    }

    const salaryHistory = (await gateway.$queryRawUnsafe(salaryQuery, ...queryParams)) as any[];

    const getExtra = async (table: string, dateCol: string) => {
      let q = `SELECT t.* FROM ${table} t 
        LEFT JOIN Staff s ON t.staffId = s.id
        WHERE t.staffId = ?`;
      const p: any[] = [staffId];
      if (m && y) {
        q += ` AND YEAR(t.${dateCol}) = ? AND MONTH(t.${dateCol}) = ?`;
        p.push(y, m);
      }
      q += ` ORDER BY t.${dateCol} DESC LIMIT 20`;
      try {
        return (await gateway.$queryRawUnsafe(q, ...p)) as any[];
      } catch (e) { return []; }
    };

    const bonusHistory = await getExtra('StaffBonus', 'rewardDate');
    const penaltiesHistory = await getExtra('StaffPenalty', 'penaltyDate');

    const staffData = (await gateway.$queryRawUnsafe(
      `SELECT baseSalary FROM Staff WHERE id = ?`,
      staffId,
    )) as any[];
    const baseSalary = staffData[0]?.baseSalary || 0;

    let totalHours = 0;
    if (m && y) {
      const start = dayjs(`${y}-${m}-01`).utcOffset(7).startOf('month').format('YYYY-MM-DD');
      const end = dayjs(start).endOf('month').format('YYYY-MM-DD');
      const records = (await gateway.$queryRawUnsafe(
        `SELECT checkInTime, checkOutTime FROM StaffTimeTracking WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?`,
        staffId, start, end,
      )) as any[];
      const now = dayjs().utcOffset(7);
      records.forEach(r => {
        const checkIn = dayjs(r.checkInTime);
        const checkOut = r.checkOutTime ? dayjs(r.checkOutTime) : now;
        totalHours += Math.abs(checkOut.diff(checkIn, 'hour', true));
      });
    }

    const salary = Math.ceil((totalHours * baseSalary) / 1000) * 1000;
    let bonus = 0, penalty = 0;
    if (m && y && salaryHistory.length > 0) {
      bonus = salaryHistory[0].bonus || 0;
      penalty = salaryHistory[0].penalty || 0;
    } else {
      bonus = bonusHistory.reduce((sum, b) => sum + (b.amount || 0), 0);
      penalty = penaltiesHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
    }

    return {
      salaryHistory, bonusHistory, penaltiesHistory,
      summary: { totalHours: parseFloat(totalHours.toFixed(2)), salary, bonus, penalty, netSalary: salary + bonus - penalty }
    };
  }

  async getSalaryHistory(params: { staffId: number; month: string; year: string }, tenantId: string) {
    const { staffId, month, year } = params;
    if (!staffId || !month || !year) throw new BadRequestException('Missing parameters');
    const m = parseInt(month), y = parseInt(year);
    const now = dayjs();
    const curM = now.month() + 1, curY = now.year();

    const isPrev = curM === 1 ? (y === curY - 1 && m === 12) : (y === curY && m === curM - 1);
    if (!( (y === curY && m === curM) || isPrev )) {
      throw new BadRequestException('Chỉ được xem lịch sử của tháng hiện tại hoặc tháng trước');
    }

    return this.getSalary({ staffId, month, year }, tenantId);
  }

  async getRequests(userName: string, tenantId: string) {
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);
    const staff = await gateway.staff.findFirst({
      where: { userName, isDeleted: false },
      select: { id: true },
    });
    if (!staff) return [];
    const list = await gateway.staffRequest.findMany({
      where: { staffId: staff.id },
      include: { request: true, staff: { select: { userName: true } } },
      orderBy: { request: { createdAt: 'desc' } },
    });
    return list.map(({ request, staff: s }) => ({
      id: String(request.id),
      type: request.type,
      status: request.status,
      metadata: (request.metadata as Record<string, unknown>) ?? {},
      createdAt: request.createdAt.toISOString(),
      staff: { userName: s.userName },
    }));
  }

  async getAllRequests(tenantId: string) {
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);
    const list = await gateway.staffRequest.findMany({
      include: { request: true, staff: { select: { fullName: true, userName: true } } },
      orderBy: { request: { createdAt: 'desc' } },
    });
    return list.map(({ request, staffId, staff: s }) => ({
      id: String(request.id),
      userId: String(staffId),
      userName: s.userName,
      type: request.type,
      status: request.status,
      metadata: (request.metadata as Record<string, unknown>) ?? {},
      createdAt: request.createdAt.toISOString(),
      staff: { fullName: s.fullName, userName: s.userName },
    }));
  }

  async createRequest(userName: string, body: { type: string; metadata?: Record<string, unknown> }, tenantId: string) {
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);
    const staff = await gateway.staff.findFirst({
      where: { userName, isDeleted: false },
      select: { id: true },
    });
    if (!staff) throw new BadRequestException('Staff not found');
    const request = await gateway.request.create({
      data: {
        type: body.type ?? 'late_arrival',
        status: 'PENDING',
        metadata: (body.metadata ?? {}) as any,
      },
    });
    await gateway.staffRequest.create({
      data: { requestId: request.id, staffId: staff.id },
    });
    return {
      id: String(request.id),
      userId: staff.id,
      userName,
      type: request.type,
      status: request.status,
      metadata: (request.metadata as Record<string, unknown>) ?? {},
      createdAt: request.createdAt.toISOString(),
    };
  }

  async deleteRequest(userName: string, id: string, tenantId: string) {
    const requestId = parseInt(id, 10);
    if (Number.isNaN(requestId)) throw new BadRequestException('Invalid request id');
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);
    const staff = await gateway.staff.findFirst({
      where: { userName, isDeleted: false },
      select: { id: true },
    });
    if (!staff) throw new BadRequestException('Staff not found');
    const sr = await gateway.staffRequest.findFirst({
      where: { requestId, staffId: staff.id },
      select: { id: true },
    });
    if (!sr) throw new NotFoundException('Request not found');
    await gateway.staffRequest.delete({ where: { id: sr.id } });
    await gateway.request.delete({ where: { id: requestId } });
    return { success: true };
  }

  async updateRequestStatus(id: string, status: 'APPROVED' | 'REJECTED', tenantId: string) {
    const requestId = parseInt(id, 10);
    if (Number.isNaN(requestId)) throw new BadRequestException('Invalid request id');
    const gateway = await this.this.tenantGateway.getGatewayClient(tenantId);
    const request = await gateway.request.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');
    await gateway.request.update({
      where: { id: requestId },
      data: { status },
    });
    return { success: true };
  }
}
