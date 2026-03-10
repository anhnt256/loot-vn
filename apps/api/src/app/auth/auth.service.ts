import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { signJWT } from '../lib/jwt';
import { getFnetDB, getFnetPrisma } from '../lib/db';
import dayjs from '../lib/dayjs';
import * as crypto from 'crypto';
import {
  checkUserCreationRateLimit,
  checkLoginRateLimit,
  checkDatabaseRateLimit,
} from '../lib/rate-limit';
import {
  getDebugUserId,
  shouldBypassOnlineCheck,
  getDebugConfig,
  getDebugBranch,
} from '../lib/debug-utils';
import { calculateActiveUsersInfo } from '../lib/user-calculator';
import { isNewUser } from '../lib/timezone-utils';

@Injectable()
export class AuthService {
  private readonly ADMIN_USERNAME =
    process.env.ADMIN_USERNAME || process.env.NEXT_PUBLIC_ADMIN_USERNAME;

  constructor(private readonly prisma: PrismaService) {}

  async checkIsReturnedUser(userId: number, fnetDB: any) {
    try {
      const recentDates = (await fnetDB.$queryRawUnsafe(`
        SELECT EnterDate, COUNT(*) as sessionsOnThisDay
        FROM systemlogtb
        WHERE UserId = ${userId} AND status = 3
        GROUP BY EnterDate ORDER BY EnterDate DESC LIMIT 2
      `)) as any[];

      if (recentDates.length < 2)
        return { isReturned: false, daysSinceLastSession: null };

      const latestDate = new Date(recentDates[0].EnterDate);
      const previousDate = new Date(recentDates[1].EnterDate);
      const daysDiff = Math.floor(
        (latestDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      return { isReturned: daysDiff >= 30, daysSinceLastSession: daysDiff };
    } catch (error) {
      console.error('Error checking returned user:', error);
      return { isReturned: false, daysSinceLastSession: null };
    }
  }

  async getUserCreationInfo(userId: number, branch: string) {
    try {
      const fnetDB = await getFnetDB(branch);
      const userRecord = await fnetDB.$queryRaw<any[]>`
        SELECT RecordDate, LastLoginDate FROM fnet.usertb WHERE UserId = ${userId} LIMIT 1
      `;
      if (!userRecord?.length)
        return {
          isNewUser: false,
          recordDate: null,
          isReturnedUser: false,
          lastLoginDate: null,
        };

      const recordDate = userRecord[0].RecordDate;
      const lastLoginDate = userRecord[0].LastLoginDate;
      const isNew = isNewUser(recordDate);
      const returnedUserInfo = await this.checkIsReturnedUser(userId, fnetDB);

      return {
        isNewUser: isNew,
        recordDate: recordDate ? dayjs(recordDate).format('YYYY-MM-DD') : null,
        isReturnedUser: returnedUserInfo.isReturned,
        lastLoginDate: lastLoginDate
          ? dayjs(lastLoginDate).format('YYYY-MM-DD')
          : null,
      };
    } catch (error) {
      console.error('Error getting user creation info:', error);
      return {
        isNewUser: false,
        recordDate: null,
        isReturnedUser: false,
        lastLoginDate: null,
      };
    }
  }

  async login(body: any, branchFromCookie?: string) {
    const {
      userName,
      machineName,
      isAdmin,
      password,
      loginMethod,
      macAddress,
      currentMacAddress,
    } = body;

    if (isAdmin) {
      let loginType = 'username';
      let userId,
        role,
        staffUserName = this.ADMIN_USERNAME;
      let staffData: any = null;
      let branchFromMac = branchFromCookie;

      if (loginMethod === 'account' && password) {
        const hashPassword = (pwd: string) =>
          crypto.createHash('sha256').update(pwd).digest('hex');
        const staffByUsername = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT id, userName, fullName, branch, isDeleted, isAdmin, password, staffType FROM Staff 
           WHERE userName = ? AND isDeleted = false AND isAdmin = false`,
          userName,
        );

        if (staffByUsername.length === 0)
          throw new UnauthorizedException(
            'Tên đăng nhập hoặc mật khẩu không đúng',
          );
        staffData = staffByUsername[0];

        const resetPasswordHash = hashPassword(
          'RESET_PASSWORD_REQUIRED_' + staffData.id,
        );
        if (staffData.password === resetPasswordHash) {
          return { requirePasswordReset: true, staffId: staffData.id };
        }

        if (staffByUsername[0].password !== hashPassword(password))
          throw new UnauthorizedException(
            'Tên đăng nhập hoặc mật khẩu không đúng',
          );

        if (!staffData.branch)
          throw new UnauthorizedException('Staff account không có branch');
        loginType = 'account';
        userId = staffData.id;
        role = 'staff';
        staffUserName = staffData.userName;
        branchFromMac = staffData.branch;
      } else if (loginMethod === 'mac') {
        // simplified MAC login for brevity, referencing original logic
        if (!currentMacAddress)
          throw new UnauthorizedException(
            'Không thể lấy MAC address hiện tại của máy',
          );
        const normalizeMac = (mac: string) =>
          mac.replace(/[:-]/g, '').toUpperCase();
        if (normalizeMac(macAddress) !== normalizeMac(currentMacAddress))
          throw new UnauthorizedException('MAC address không khớp');

        const normalizedMacForDB = macAddress
          .replaceAll(':', '-')
          .toUpperCase();
        const computer = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT branch, name FROM Computer WHERE localIp = ? LIMIT 1`,
          normalizedMacForDB,
        );
        if (!computer?.length)
          throw new UnauthorizedException('MAC address không được nhận diện');
        branchFromMac = computer[0].branch;
        userId = -99;
        role = 'admin';
        loginType = 'mac';
      } else if (userName === this.ADMIN_USERNAME) {
        userId = -99;
        role = 'admin';
      } else {
        throw new UnauthorizedException('Invalid admin credentials');
      }

      const finalBranch = branchFromMac || branchFromCookie || 'GO_VAP';
      const shifts = await this.prisma.$queryRaw<
        any[]
      >`SELECT * FROM WorkShift WHERE branch = ${finalBranch} ORDER BY startTime, id`;
      const workShifts = shifts.map((s) => ({
        ...s,
        startTime: s.startTime ? dayjs(s.startTime).format('HH:mm:ss') : null,
        endTime: s.endTime ? dayjs(s.endTime).format('HH:mm:ss') : null,
      }));

      const adminData: any = {
        userId,
        id: userId,
        userName: staffUserName,
        role,
        loginType,
        branch: finalBranch,
        workShifts,
      };
      if (staffData) {
        adminData.staffType = staffData.staffType;
        adminData.staffId = staffData.id;
      }

      const token = await signJWT(adminData);
      return { token, ...adminData };
    }

    // User Login
    const fnetDB = await getFnetDB(branchFromCookie || 'GO_VAP');
    const fnetPrisma = await getFnetPrisma(branchFromCookie || 'GO_VAP');

    const loginRateLimit = await checkLoginRateLimit(machineName);
    if (!loginRateLimit.allowed)
      throw new BadRequestException(
        `Quá nhiều lần đăng nhập. Reset sau ${new Date(loginRateLimit.resetTime).toLocaleString('vi-VN')}`,
      );

    const user: any = await fnetDB.$queryRaw<any>(fnetPrisma.sql`
      SELECT userId FROM fnet.systemlogtb AS t1
      WHERE t1.MachineName = ${machineName}
      ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC LIMIT 1
    `);

    let userId = user[0]?.userId ?? null;
    if (userId == null && shouldBypassOnlineCheck()) {
      userId = getDebugConfig().defaultUserId;
    }
    if (userId == null)
      throw new UnauthorizedException('User must be online to login');

    let existingUser = await this.prisma.user.findFirst({
      where: { userId: Number(userId), branch: branchFromCookie || 'GO_VAP' },
    });

    if (!existingUser) {
      if (!userName?.trim())
        throw new BadRequestException('Username is required for new users');
      const trimmedUsername = userName.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 20)
        throw new BadRequestException('Username must be 3-20 chars');

      const creationRate = await checkUserCreationRateLimit(
        machineName,
        branchFromCookie || '',
      );
      if (!creationRate.allowed)
        throw new BadRequestException('Rate limit reached for user creation');

      const dbRate = await checkDatabaseRateLimit(branchFromCookie || '');
      if (!dbRate.allowed)
        throw new BadRequestException('Branch creation rate limit reached');

      const usernameExists = await this.prisma.user.findFirst({
        where: { userName: trimmedUsername, branch: branchFromCookie || '' },
      });
      if (usernameExists)
        throw new BadRequestException('Username already exists');

      await this.prisma.$executeRaw`
            INSERT INTO User (userName, userId, branch, rankId, stars, magicStone, createdAt, updatedAt)
            VALUES (${trimmedUsername}, ${Number(userId)}, ${branchFromCookie || ''}, 1, 0, 0, NOW(), NOW())
        `;
      existingUser = await this.prisma.user.findFirst({
        where: { userName: trimmedUsername, branch: branchFromCookie || '' },
      });
    }

    if (!existingUser)
      throw new InternalServerErrorException('Failed to retrieve user');

    await calculateActiveUsersInfo([Number(userId)], branchFromCookie || '');
    const userCreationInfo = await this.getUserCreationInfo(
      Number(userId),
      branchFromCookie || '',
    );
    const shifts = await this.prisma.$queryRaw<
      any[]
    >`SELECT * FROM WorkShift WHERE branch = ${branchFromCookie || 'GO_VAP'} ORDER BY startTime, id`;

    const userData = {
      userId: Number(userId),
      userName: existingUser.userName,
      branch: branchFromCookie || 'GO_VAP',
      role: 'user',
      isNewUser: userCreationInfo.isNewUser,
      isReturnedUser: userCreationInfo.isReturnedUser,
      workShifts: shifts,
    };

    const token = await signJWT(userData);
    return { token, ...userData };
  }
}
