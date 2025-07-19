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
import { getCurrentTimeVN, getVNTimeForPrisma } from "@/lib/timezone-utils";
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

  // Rate limiting: Max 5 check-ins per hour per user
  const rateLimitResult = await checkCheckInRateLimit(String(userId), branch);
  if (!rateLimitResult.allowed) {
    const resetTime = new Date(rateLimitResult.resetTime).toLocaleString(
      "vi-VN",
    );
    return {
      error: `Quá nhiều lần check-in. Vui lòng thử lại sau ${resetTime}`,
    };
  }

  // Daily check-in limit
  const dailyLimitResult = await checkDailyCheckInLimit(String(userId), branch);
  if (!dailyLimitResult.allowed) {
    return {
      error: `Bạn đã check-in ${dailyLimitResult.count}/${dailyLimitResult.maxAllowed} lần hôm nay. Vui lòng thử lại vào ngày mai!`,
    };
  }

  // Enhanced anti-spam: Prevent check-in if last check-in was less than 30 minutes ago
  const lastCheckIns = await db.$queryRaw`
    SELECT * FROM "CheckInResult" 
    WHERE "userId" = ${userId} AND "branch" = ${branch}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;
  const lastCheckIn = (lastCheckIns as any[])[0];

  if (lastCheckIn) {
    const now = getCurrentTimeVN();
    const last = dayjs(dayjs(lastCheckIn.createdAt).subtract(7, "hours"));
    const minutesSinceLastCheckIn = now.diff(last, "minute");

    if (minutesSinceLastCheckIn < 30) {
      const remainingMinutes = 30 - minutesSinceLastCheckIn;
      return {
        error: `Bạn vừa check-in xong, vui lòng chờ ${remainingMinutes} phút trước khi check-in tiếp!`,
      };
    }
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

    console.log('getVNTimeForPrisma', getVNTimeForPrisma().toISOString())

    await db.$transaction(async (tx) => {
      // Create checkInResult using raw SQL
      const checkInResults = await tx.$queryRaw`
        INSERT INTO "CheckInResult" ("userId", "branch", "createdAt", "updatedAt")
        VALUES (${userId}, ${branch}, ${getVNTimeForPrisma()}, ${getVNTimeForPrisma()})
        RETURNING *
      `;
      checkIn = (checkInResults as any[])[0];

      if (checkIn) {
        const { id } = checkIn;

        // Find user using raw SQL
        const users = await tx.$queryRaw`
          SELECT * FROM "User" 
          WHERE "userId" = ${userId} AND "branch" = ${branch}
          LIMIT 1
        `;
        const user = (users as any[])[0];

        if (user) {
          const { stars: oldStars } = user;
          const newStars = oldStars + availableCheckIn;

          // Create UserStarHistory using raw SQL
          await tx.$executeRaw`
            INSERT INTO "UserStarHistory" ("userId", "type", "oldStars", "newStars", "targetId", "createdAt", "branch", "updatedAt")
            VALUES (${userId}, 'CHECK_IN', ${oldStars}, ${newStars}, ${id}, ${getVNTimeForPrisma()}, ${branch}, ${getVNTimeForPrisma()})
          `;

          // Update user stars using raw SQL
          await tx.$executeRaw`
            UPDATE "User" 
            SET "stars" = ${newStars}, "updatedAt" = ${getVNTimeForPrisma()}
            WHERE "id" = ${user.id}
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
