import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService, TenantPrismaService, GatewayPrismaService } from '../database/prisma.service';
import { getTenantDbUrl } from '../database/tenant-gateway.service';
import { signJWT } from '../lib/jwt';
import dayjs from '../lib/dayjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService,
  ) {}

  private hashPassword(pwd: string): string {
    return crypto.createHash('sha256').update(pwd).digest('hex');
  }

  async getTenantInfo(tenantId: string) {
    if (!tenantId) return null;
    const tenant = await this.tenantPrisma.tenant.findFirst({
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

  /**
   * Single entry for login. For staff/account: requires tenantId, uses tenant DB + API key check.
   * For other methods (future): may use central DB.
   */
  async login(body: any, tenantId?: string | null) {
    const loginMethod = body.loginMethod;
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

    if (loginMethod === 'user') {
      throw new BadRequestException('Đăng nhập dành cho user hiện đang được phát triển');
    }

    if (loginMethod === 'admin') {
      const staff = await (this.tenantPrisma as any).staff.findUnique({
        where: { userName },
      });

      if (!staff || staff.isDeleted) {
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
      }

      if (!staff.isAdmin) {
        throw new UnauthorizedException('Chỉ có admin mới được phép truy cập bằng phương thức này');
      }

      if (staff.password !== this.hashPassword(password)) {
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
      }

      const payload = {
        userId: staff.id,
        id: staff.id,
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

    throw new BadRequestException('Phương thức đăng nhập không hợp lệ. Dùng Admin, staff hoặc account.');
  }

  private async loginStaff(userName: string, password: string, tenantId: string) {
    let tenant = await this.tenantPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.tenantPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) {
      throw new UnauthorizedException('Tenant không hợp lệ');
    }

    const apiKey = await this.tenantPrisma.apiKey.findFirst({
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
    const gateway = await this.gatewayPrisma.getClient(dbUrl);

    const staffList = await gateway.$queryRawUnsafe<any[]>(
      `SELECT id, userName, fullName, isDeleted, isAdmin, password, staffType FROM Staff 
       WHERE userName = ? AND isDeleted = false`,
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

    if (staff.password !== this.hashPassword(password)) {
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
      userId: staff.id,
      id: staff.id,
      userName: staff.userName,
      fullName: staff.fullName,
      role,
      isAdmin,
      loginType: 'account',
      workShifts,
      staffType: staff.staffType,
      staffId: staff.id,
    };

    const token = await signJWT(payload);
    return { token, ...payload };
  }
}
