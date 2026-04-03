import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { MasterPrismaService, TenantPrismaService, FnetPrismaService } from '../database/prisma.service';
import { getTenantDbUrl } from '../database/tenant-gateway.service';
import { signJWT } from '../lib/jwt';
import dayjs from '../lib/dayjs';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly fnetPrisma: FnetPrismaService,
  ) {}

  private hashPassword(pwd: string): string {
    return crypto.createHash('sha256').update(pwd).digest('hex');
  }

  private async verifyPassword(plain: string, stored: string): Promise<boolean> {
    if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
      return bcrypt.compare(plain, stored);
    }
    return stored === this.hashPassword(plain);
  }

  /** Resolve tenant from MasterDB and return tenant record + dbUrl */
  private async resolveTenant(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) {
      throw new UnauthorizedException('Tenant không hợp lệ');
    }

    const apiKey = await this.masterPrisma.apiKey.findFirst({
      where: { tenantId: tenant.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!apiKey) {
      throw new UnauthorizedException('Tenant chưa cấu hình API key');
    }
    if (apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
      throw new UnauthorizedException('Hệ thống đã hết hạn, vui lòng gia hạn để sử dụng');
    }

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) {
      throw new BadRequestException('Tenant chưa cấu hình DB URL. Vui lòng cập nhật trong quản lý tenant.');
    }

    return { tenant, dbUrl };
  }

  async getTenantInfo(tenantId: string) {
    if (!tenantId) return null;
    const tenant = await this.masterPrisma.tenant.findFirst({
      where: { tenantId },
      include: {
        organization: {
          select: { primaryColor: true, secondaryColor: true }
        }
      }
    });
    if (!tenant) return null;
    return {
      name: tenant.name,
      logo: tenant.logo,
      primaryColor: tenant.organization?.primaryColor,
      secondaryColor: tenant.organization?.secondaryColor
    };
  }

  async login(body: any, tenantId?: string | null) {
    const loginMethod = body.loginMethod;

    if (loginMethod === 'client') {
      if (!tenantId?.trim()) {
        throw new BadRequestException('x-tenant-id header is required for client login');
      }
      const macAddress = (body.macAddress ?? '').trim();
      if (!macAddress) {
        throw new BadRequestException('macAddress là bắt buộc cho phương thức đăng nhập client');
      }
      return this.loginClient(macAddress, tenantId.trim());
    }

    const userName = (body.userName ?? body.user ?? '').trim();
    const password = body.password;

    if (!userName || !password) {
      throw new BadRequestException('Tên đăng nhập và mật khẩu là bắt buộc');
    }

    if (loginMethod === 'staff') {
      if (!tenantId?.trim()) {
        throw new BadRequestException('x-tenant-id header is required for staff login');
      }
      return this.loginStaff(userName, password, tenantId.trim());
    }

    if (loginMethod === 'admin') {
      if (!tenantId?.trim()) {
        throw new BadRequestException('x-tenant-id header is required for admin login');
      }
      return this.loginAdmin(userName, password, tenantId.trim());
    }

    throw new BadRequestException('Phương thức đăng nhập không hợp lệ. Dùng admin, staff hoặc client.');
  }

  private async loginAdmin(userName: string, password: string, tenantId: string) {
    const { dbUrl } = await this.resolveTenant(tenantId);
    const gateway = await this.tenantPrisma.getClient(dbUrl);

    const staffList = await gateway.$queryRawUnsafe<any[]>(
      `SELECT id, userName, fullName, isDeleted, isAdmin, password, staffType FROM Staff WHERE userName = ? AND isDeleted = false`,
      userName,
    );

    if (!staffList?.length) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const staff = staffList[0];

    if (!staff.isAdmin) {
      throw new UnauthorizedException('Chỉ có admin mới được phép truy cập bằng phương thức này');
    }

    if (!(await this.verifyPassword(password, staff.password))) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const payload = {
      userId: Number(staff.id),
      id: Number(staff.id),
      userName: staff.userName,
      fullName: staff.fullName,
      role: 'admin',
      isAdmin: true,
      loginType: 'admin',
      staffType: staff.staffType,
    };

    const token = await signJWT(payload);
    return { token, ...payload };
  }

  private async loginStaff(userName: string, password: string, tenantId: string) {
    const { tenant, dbUrl } = await this.resolveTenant(tenantId);
    const gateway = await this.tenantPrisma.getClient(dbUrl);

    const staffList = await gateway.$queryRawUnsafe<any[]>(
      `SELECT id, userName, fullName, isDeleted, isAdmin, password, staffType FROM Staff WHERE userName = ? AND isDeleted = false`,
      userName,
    );

    if (!staffList?.length) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const staff = staffList[0];

    const resetPasswordHash = this.hashPassword('RESET_PASSWORD_REQUIRED_' + staff.id);
    if (staff.password === resetPasswordHash) {
      return { requirePasswordReset: true, staffId: staff.id };
    }

    if (!(await this.verifyPassword(password, staff.password))) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const isAdmin = !!staff.isAdmin;
    const role = isAdmin ? 'admin' : 'staff';

    const shifts = await gateway.$queryRawUnsafe<any[]>(
      `SELECT * FROM WorkShift ORDER BY startTime, id`,
    );
    const workShifts = (shifts || []).map((s: any) => ({
      ...s,
      startTime: s.startTime ? dayjs(s.startTime).format('HH:mm:ss') : null,
      endTime: s.endTime ? dayjs(s.endTime).format('HH:mm:ss') : null,
    }));

    const payload = {
      userId: Number(staff.id),
      id: Number(staff.id),
      userName: staff.userName,
      fullName: staff.fullName,
      role,
      isAdmin,
      loginType: 'account',
      workShifts,
      staffType: staff.staffType,
      staffId: Number(staff.id),
    };

    const token = await signJWT(payload);
    return { token, ...payload };
  }

  /**
   * Client login: macAddress → Computer (mainDB) → IP → systemlogtb (fnetDB) → userId
   * Auto-create User in mainDB if not exists.
   */
  private async loginClient(macAddress: string, tenantId: string) {
    const { tenant, dbUrl } = await this.resolveTenant(tenantId);
    const gateway = await this.tenantPrisma.getClient(dbUrl);

    // 1. Tìm Computer trong mainDB theo macAddress → lấy IP
    const computers = await gateway.$queryRawUnsafe<any[]>(
      `SELECT id, macAddress, ip, name, localIp FROM Computer WHERE macAddress = ? AND status = 1 LIMIT 1`,
      macAddress,
    );
    if (!computers?.length) {
      throw new BadRequestException('Không tìm thấy máy tính với MAC address này');
    }
    const computer = computers[0];
    const computerIp = computer.ip || computer.localIp;
    if (!computerIp) {
      throw new BadRequestException('Máy tính chưa có thông tin IP');
    }

    // 2. Tìm trong systemlogtb (fnetDB) theo IP → lấy userId đang login
    const fnetUrl = tenant.fnetUrl;
    if (!fnetUrl) {
      throw new BadRequestException('Tenant chưa cấu hình Fnet URL');
    }
    const fnet = await this.fnetPrisma.getClient(fnetUrl);

    const sessions = await fnet.$queryRawUnsafe<any[]>(
      `SELECT UserId, MachineName, IPAddress, EnterDate, EnterTime FROM systemlogtb WHERE IPAddress = ? AND Status = 3 ORDER BY SystemLogId DESC LIMIT 1`,
      computerIp,
    );
    if (!sessions?.length) {
      throw new UnauthorizedException('Không tìm thấy phiên đăng nhập nào trên máy này');
    }
    const session = sessions[0];
    const fnetUserId = Number(session.UserId);

    // 3. Lấy thông tin user + machineGroupId từ usertb (fnetDB)
    const fnetUsers = await fnet.$queryRawUnsafe<any[]>(
      `SELECT UserId, UserName, FirstName, LastName, MachineGroupId FROM usertb WHERE UserId = ? LIMIT 1`,
      fnetUserId,
    );
    const fnetUser = fnetUsers?.[0];
    const fnetUserName = fnetUser?.UserName || `user_${fnetUserId}`;
    const fnetFullName = fnetUser
      ? [fnetUser.LastName, fnetUser.FirstName].filter(Boolean).join(' ') || fnetUserName
      : fnetUserName;

    // 4. Auto-create / update User trong mainDB (userId là PK, đồng bộ từ fnet)
    const existingUsers = await gateway.$queryRawUnsafe<any[]>(
      `SELECT userId FROM User WHERE userId = ? LIMIT 1`,
      fnetUserId,
    );
    if (!existingUsers?.length) {
      await gateway.$executeRawUnsafe(
        `INSERT INTO User (userId, userName, rankId, stars, magicStone, isUseApp, createdAt, updatedAt) VALUES (?, ?, 1, 0, 0, true, NOW(), NOW())`,
        fnetUserId,
        fnetUserName,
      );
    } else {
      await gateway.$executeRawUnsafe(
        `UPDATE User SET userName = ?, updatedAt = NOW() WHERE userId = ?`,
        fnetUserName,
        fnetUserId,
      );
    }

    // 5. Tạo JWT token
    const payload = {
      userId: fnetUserId,
      userName: fnetUserName,
      fullName: fnetFullName,
      role: 'client',
      loginType: 'client',
      computerId: computer.id,
      computerName: computer.name,
      macAddress,
      machineGroupId: fnetUser?.MachineGroupId ? Number(fnetUser.MachineGroupId) : null,
    };

    const token = await signJWT(payload);
    return { token, ...payload };
  }
}
