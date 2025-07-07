"use server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { checkCheckInRateLimit, checkDailyCheckInLimit } from "@/lib/rate-limit";

import { CreateCheckInResult } from "./schema";
import { InputType, ReturnType } from "./type";
import dayjs from "@/lib/dayjs";
import {
  calculateDailyUsageTime,
  getCurrentDayOfWeekVN,
} from "@/lib/battle-pass-utils";
import { 
  getCurrentTimeVN,
  getVNTimeForPrisma,
  getVNStartOfDayForPrisma
} from "@/lib/timezone-utils";
import { cookies } from "next/headers";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = data; // Remove addedStar from client input
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
    const resetTime = new Date(rateLimitResult.resetTime).toLocaleString("vi-VN");
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

  const fnetDB = await getFnetDB();
  const fnetPrisma = await getFnetPrisma();

  const startOfDayVN = getVNStartOfDayForPrisma();

  console.log('Start of day VN (Date object):', startOfDayVN);
  console.log('Current time VN (Date object):', getVNTimeForPrisma());

  // Enhanced anti-spam: Prevent check-in if last check-in was less than 30 minutes ago
  const lastCheckIn = await db.checkInResult.findFirst({
    where: { userId, branch },
    orderBy: { createdAt: "desc" },
  });

  if (lastCheckIn) {
    const now = getCurrentTimeVN();
    const last = dayjs(lastCheckIn.createdAt);
    const minutesSinceLastCheckIn = now.diff(last, "minute");
    
    if (minutesSinceLastCheckIn < 30) {
      const remainingMinutes = 30 - minutesSinceLastCheckIn;
      return {
        error: `Bạn vừa check-in xong, vui lòng chờ ${remainingMinutes} phút trước khi check-in tiếp!`,
      };
    }
  }

  try {
    // Get user's play sessions from fnet database
    const query = fnetPrisma.sql`
      SELECT *
      FROM fnet.systemlogtb AS t1
      WHERE t1.UserId = ${userId.toString()}
        AND t1.status = 3
        AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) = CURDATE()

      UNION ALL

      SELECT *
      FROM (
             SELECT *
             FROM fnet.systemlogtb AS t1
             WHERE t1.UserId = ${userId.toString()}
               AND t1.status = 3
               AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) < CURDATE()
      ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
        LIMIT 1
        ) AS t2`;
    const result = await fnetDB.$queryRaw<any[]>(query);

    // Calculate total play time using utility function
    const totalPlayTime = calculateDailyUsageTime(result);

    console.log('Total play time:', totalPlayTime);

    // Get check-in configuration for today
    const checkInItems = await db.checkInItem.findMany();
    const today = getCurrentDayOfWeekVN();
    const todayCheckIn = checkInItems.find((item) => item.dayName === today);
    const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

    console.log('Today:', today);
    console.log('Stars per hour:', starsPerHour);
    console.log('Check-in items:', checkInItems);

    // Server-side calculation of stars to earn (don't trust client input)
    const starsToEarn = Math.floor(totalPlayTime * starsPerHour);

    console.log('Stars to earn (totalPlayTime * starsPerHour):', starsToEarn);

    // Check if user has already claimed maximum stars for today
    const userClaim = await db.userStarHistory.findMany({
      where: {
        userId: userId,
        branch: branch,
        type: "CHECK_IN",
        createdAt: {
          gte: startOfDayVN,
        },
      },
    });

    const totalClaimed = userClaim.reduce((acc, item) => {
      const difference = (item.newStars ?? 0) - (item.oldStars ?? 0);
      return acc + difference;
    }, 0);

    console.log('Total claimed today:', totalClaimed);
    console.log('User claim history:', userClaim);

    if (totalClaimed >= starsToEarn) {
      return {
        error: "Bạn chưa có sao để nhận, hãy chơi thêm để nhận sao nhé!",
      };
    }

    // Calculate actual stars to add (remaining stars)
    const actualStarsToAdd = starsToEarn - totalClaimed;

    console.log('Actual stars to add:', actualStarsToAdd);
    console.log('Remaining stars (starsToEarn - totalClaimed):', starsToEarn - totalClaimed);
    console.log('Stars per hour limit:', starsPerHour);

    // Additional validation: Ensure user has played at least 1 hour
    if (totalPlayTime < 1) {
      return {
        error: "Bạn cần chơi ít nhất 1 giờ để có thể check-in!",
      };
    }

    await db.$transaction(async (tx) => {
      checkIn = await db.checkInResult.create({
        data: {
          userId,
          branch,
          createdAt: getVNTimeForPrisma(),
        },
      });

      if (checkIn) {
        const { id } = checkIn;

        const user = await tx.user.findFirst({
          where: { userId, branch },
        });

        if (user) {
          const { stars: oldStars } = user;
          const newStars = oldStars + actualStarsToAdd;

          await tx.userStarHistory.create({
            data: {
              userId,
              type: "CHECK_IN",
              oldStars,
              newStars,
              targetId: id,
              createdAt: getVNTimeForPrisma(),
              branch,
            },
          });

          await tx.user.update({
            where: { id: user.id },
            data: {
              stars: newStars,
              updatedAt: getVNTimeForPrisma(),
            },
          });
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
