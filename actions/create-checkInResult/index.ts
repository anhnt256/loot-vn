"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import {
  checkCheckInRateLimit,
  checkDailyCheckInLimit,
} from "@/lib/rate-limit";

import { CreateCheckInResult } from "./schema";
import { InputType, ReturnType } from "./type";
import dayjs from "@/lib/dayjs";
import { calculateActiveUsersInfo } from "@/lib/user-calculator";
import { getCurrentTimeVNISO, getCurrentTimeVNDB, getStartOfDayVNISO } from "@/lib/timezone-utils";
import { cookies } from "next/headers";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = data;
  let checkIn;

  const cookieStore = await cookies();
  const branch = cookieStore.get("branch")?.value;

  if (!branch) {
    return {
      error: "Branch cookie is required but not found",
    };
  }

  // Rate limiting: Max 1 check-in per hour per user (in-memory, first line of defense)
  const rateLimitResult = await checkCheckInRateLimit(String(userId), branch);
  if (!rateLimitResult.allowed) {
    const resetTime = new Date(rateLimitResult.resetTime).toLocaleString(
      "vi-VN",
    );
    return {
      error: `Bạn chỉ có thể check-in 1 lần mỗi giờ. Vui lòng thử lại sau ${resetTime}`,
    };
  }

  // Daily check-in limit
  const dailyLimitResult = await checkDailyCheckInLimit(String(userId), branch);
  if (!dailyLimitResult.allowed) {
    return {
      error: `Bạn đã check-in ${dailyLimitResult.count}/${dailyLimitResult.maxAllowed} lần hôm nay. Vui lòng thử lại vào ngày mai!`,
    };
  }

  try {
    // Use calculateActiveUsersInfo to get user's check-in information
    const userInfoResults = await calculateActiveUsersInfo([userId], branch);

    if (userInfoResults.length === 0) {
      return {
        error: "Không tìm thấy thông tin người dùng",
      };
    }

    const userInfo = userInfoResults[0];
    const { availableCheckIn } = userInfo;

    // Check if user has available check-in stars
    if (availableCheckIn <= 0) {
      return {
        error: "Bạn chưa có sao để nhận, hãy chơi thêm để nhận sao nhé!",
      };
    }

    // Kiểm tra tổng điểm đã claim trong ngày (tối đa 24k/ngày)
    const startOfDayVN = getStartOfDayVNISO();
    const totalClaimedTodayResult = await db.$queryRaw<any[]>`
      SELECT COALESCE(SUM(newStars - oldStars), 0) as totalClaimed
      FROM UserStarHistory
      WHERE userId = ${userId}
        AND branch = ${branch}
        AND type = 'CHECK_IN'
        AND createdAt >= ${startOfDayVN}
    `;
    const totalClaimedToday = Number(totalClaimedTodayResult[0]?.totalClaimed || 0);
    const maxDailyCheckInPoints = 24000;
    const remainingDailyLimit = maxDailyCheckInPoints - totalClaimedToday;

    if (remainingDailyLimit <= 0) {
      return {
        error: `Bạn đã nhận tối đa ${maxDailyCheckInPoints.toLocaleString()} điểm danh hôm nay. Vui lòng thử lại vào ngày mai!`,
      };
    }

    // Giới hạn số điểm có thể claim không vượt quá giới hạn còn lại
    const actualPointsToClaim = Math.min(availableCheckIn, remainingDailyLimit);

    // Transaction với locking để chặn race condition (double click)
    await db.$transaction(async (tx) => {
      // Anti-spam check TRONG transaction với FOR UPDATE để lock row
      // Chặn double click và race condition
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
        const last = dayjs(dayjs(lastCheckIn.createdAt).subtract(7, "hours"));
        const minutesSinceLastCheckIn = now.diff(last, "minute");

        // Yêu cầu ít nhất 55 phút giữa các lần check-in (gần 1h nhưng có buffer nhỏ)
        if (minutesSinceLastCheckIn < 55) {
          const remainingMinutes = 55 - minutesSinceLastCheckIn;
          throw new Error(`Bạn vừa check-in xong, vui lòng chờ ${remainingMinutes} phút trước khi check-in tiếp!`);
        }
      }

      // Create checkInResult using raw SQL
      await tx.$executeRaw`
        INSERT INTO CheckInResult (userId, branch, createdAt)
        VALUES (${userId}, ${branch}, ${getCurrentTimeVNDB()})
      `;
      
      // Get the inserted record ID
      const checkInResults = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id`;
      const checkInId = (checkInResults as any[])[0]?.id;
      
      // Get the full checkIn record
      const checkInRecords = await tx.$queryRaw`
        SELECT * FROM CheckInResult WHERE id = ${checkInId}
      `;
      checkIn = (checkInRecords as any[])[0];

      if (checkIn) {
        const { id } = checkIn;

        // Find user với FOR UPDATE để lock row, chặn concurrent update
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

          // Create UserStarHistory using raw SQL
          await tx.$executeRaw`
            INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
            VALUES (${userId}, 'CHECK_IN', ${oldStars}, ${newStars}, ${id}, ${getCurrentTimeVNDB()}, ${branch})
          `;

          // Update user stars using raw SQL
          await tx.$executeRaw`
            UPDATE User 
            SET stars = ${newStars}, updatedAt = ${getCurrentTimeVNDB()}
            WHERE userId = ${userId} AND branch = ${branch}
          `;
        }
      }
    });
  } catch (error: any) {
    return {
      error: error?.message || "Something went wrong",
    };
  }

  return { data: checkIn };
};

export const createCheckInResult = createSafeAction(
  CreateCheckInResult,
  handler,
);
