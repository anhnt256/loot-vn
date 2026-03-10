import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  checkCheckInRateLimit,
  checkDailyCheckInLimit,
} from '../lib/rate-limit';
import {
  getCurrentTimeVNISO,
  getCurrentTimeVNDB,
  getStartOfDayVNISO,
} from '../lib/timezone-utils';
import { calculateActiveUsersInfo } from '../lib/user-calculator';
import dayjs from '../lib/dayjs';

@Injectable()
export class CheckInResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: number; branch: string; token: string }) {
    const { userId, branch } = data;
    let checkIn;

    const rateLimitResult = await checkCheckInRateLimit(String(userId), branch);
    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime).toLocaleString(
        'vi-VN',
      );
      throw new BadRequestException(
        `Bạn chỉ có thể check-in 1 lần mỗi giờ. Vui lòng thử lại sau ${resetTime}`,
      );
    }

    const dailyLimitResult = await checkDailyCheckInLimit(
      String(userId),
      branch,
    );
    if (!dailyLimitResult.allowed) {
      throw new BadRequestException(
        `Bạn đã check-in ${dailyLimitResult.count}/${dailyLimitResult.maxAllowed} lần hôm nay. Vui lòng thử lại vào ngày mai!`,
      );
    }

    try {
      const userInfoResults = await calculateActiveUsersInfo([userId], branch);

      if (userInfoResults.length === 0) {
        throw new BadRequestException('Không tìm thấy thông tin người dùng');
      }

      const userInfo = userInfoResults[0];
      const { availableCheckIn } = userInfo;

      if (availableCheckIn <= 0) {
        throw new BadRequestException(
          'Bạn chưa có sao để nhận, hãy chơi thêm để nhận sao nhé!',
        );
      }

      const startOfDayVN = getStartOfDayVNISO();
      const totalClaimedTodayResult = await this.prisma.$queryRaw<any[]>`
        SELECT COALESCE(SUM(newStars - oldStars), 0) as totalClaimed
        FROM UserStarHistory
        WHERE userId = ${userId}
          AND branch = ${branch}
          AND type = 'CHECK_IN'
          AND createdAt >= ${startOfDayVN}
      `;
      const totalClaimedToday = Number(
        totalClaimedTodayResult[0]?.totalClaimed || 0,
      );
      const maxDailyCheckInPoints = 24000;
      const remainingDailyLimit = maxDailyCheckInPoints - totalClaimedToday;

      if (remainingDailyLimit <= 0) {
        throw new BadRequestException(
          `Bạn đã nhận tối đa ${maxDailyCheckInPoints.toLocaleString()} điểm danh hôm nay. Vui lòng thử lại vào ngày mai!`,
        );
      }

      const actualPointsToClaim = Math.min(
        availableCheckIn,
        remainingDailyLimit,
      );

      await this.prisma.$transaction(async (tx) => {
        const lastCheckIns = await tx.$queryRaw<any[]>`
          SELECT * FROM CheckInResult 
          WHERE userId = ${userId} AND branch = ${branch}
          ORDER BY createdAt DESC
          LIMIT 1
          FOR UPDATE
        `;
        const lastCheckIn = lastCheckIns[0];

        if (lastCheckIn) {
          const now = dayjs(getCurrentTimeVNISO());
          const last = dayjs(dayjs(lastCheckIn.createdAt).subtract(7, 'hours'));
          const minutesSinceLastCheckIn = now.diff(last, 'minute');

          if (minutesSinceLastCheckIn < 55) {
            const remainingMinutes = 55 - minutesSinceLastCheckIn;
            throw new Error(
              `Bạn vừa check-in xong, vui lòng chờ ${remainingMinutes} phút trước khi check-in tiếp!`,
            );
          }
        }

        await tx.$executeRaw`
          INSERT INTO CheckInResult (userId, branch, createdAt)
          VALUES (${userId}, ${branch}, ${getCurrentTimeVNDB()})
        `;

        const checkInResults =
          await tx.$queryRaw`SELECT LAST_INSERT_ID() as id`;
        const checkInId = (checkInResults as any[])[0]?.id;

        const checkInRecords = await tx.$queryRaw`
          SELECT * FROM CheckInResult WHERE id = ${checkInId}
        `;
        checkIn = (checkInRecords as any[])[0];

        if (checkIn) {
          const { id } = checkIn;

          const users = await tx.$queryRaw`
            SELECT * FROM User 
            WHERE userId = ${userId} AND branch = ${branch}
            LIMIT 1
            FOR UPDATE
          `;
          const user = (users as any[])[0];

          if (user) {
            const { stars: oldStars } = user;
            const newStars = oldStars + actualPointsToClaim;

            await tx.$executeRaw`
              INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
              VALUES (${userId}, 'CHECK_IN', ${oldStars}, ${newStars}, ${id}, ${getCurrentTimeVNDB()}, ${branch})
            `;

            await tx.$executeRaw`
              UPDATE User 
              SET stars = ${newStars}, updatedAt = ${getCurrentTimeVNDB()}
              WHERE userId = ${userId} AND branch = ${branch}
            `;
          }
        }
      });

      return { success: true, data: checkIn };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Something went wrong');
    }
  }
}
