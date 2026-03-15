import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { signJWT } from '../lib/jwt';
import dayjs from '../lib/dayjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private hashPassword(pwd: string): string {
    return crypto.createHash('sha256').update(pwd).digest('hex');
  }

  /**
   * Login with loginMethod, userName (or user), password.
   * Uses DATABASE_URL only: Staff table for staff/account method.
   * If Staff.isAdmin === true → full access (admin), login all systems.
   * Multi-tenant: no branch cookie or branch in session.
   */
  async login(body: any) {
    const loginMethod = body.loginMethod;
    const userName = (body.userName ?? body.user ?? '').trim();
    const password = body.password;

    if (!userName || !password) {
      throw new BadRequestException('Tên đăng nhập và mật khẩu là bắt buộc');
    }

    // Only staff/account login: check Staff table (DATABASE_URL)
    if (loginMethod === 'staff' || loginMethod === 'account' || !loginMethod) {
      const staffList = await this.prisma.$queryRawUnsafe<any[]>(
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

      const shifts = await this.prisma.$queryRawUnsafe<any[]>(
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

    // Future: loginMethod 'user' → check User table if it has password
    throw new BadRequestException('Phương thức đăng nhập không hợp lệ. Dùng staff hoặc account.');
  }
}
