"use server";

import { db, getFnetDB } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateCheckInResult } from "./schema";
import { InputType, ReturnType } from "./type";
import dayjs, { currentTimeVN, startOfDayVN } from "@/lib/dayjs";
import { Prisma } from "@/prisma/generated/fnet-gv-client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, branch, addedStar } = data;
  let checkIn;

  const fnetDB = getFnetDB();

  try {
    const query = Prisma.sql`
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

    const totalTimeUsed = result.reduce((sum, item) => sum + item.TimeUsed, 0);
    const totalPlayTime = Math.floor(totalTimeUsed / 60);

    const checkInItems = await db.checkInItem.findMany();

    const today = dayjs().format("ddd");
    const todayCheckIn = checkInItems.find((item) => item.dayName === today);
    const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

    const canClaim = totalPlayTime * starsPerHour;

    const userClaim = await db.userStarHistory.findMany({
      where: {
        userId: userId,
        branch: branch,
        type: "CHECK_IN",
        createdAt: {
          gte: startOfDayVN, // Check if createdAt is greater than or equal to today at 00:00:00
        },
      },
    });

    const totalClaimed = userClaim.reduce((acc, item) => {
      const difference = (item.newStars ?? 0) - (item.oldStars ?? 0);
      return acc + difference;
    }, 0);

    if (totalClaimed >= canClaim) {
      return {
        error: "Bạn chưa có sao để nhận, hãy chơi thêm để nhận sao nhé!",
      };
    }

    await db.$transaction(async (tx) => {
      checkIn = await db.checkInResult.create({
        data: {
          userId,
          branch,
          createdAt: currentTimeVN,
        },
      });

      if (checkIn) {
        const { id } = checkIn;

        const user = await tx.user.findFirst({
          where: { userId, branch },
        });

        if (user) {
          const { stars: oldStars } = user;

          const newStars = oldStars + addedStar;

          await tx.userStarHistory.create({
            data: {
              userId,
              type: "CHECK_IN",
              oldStars,
              newStars,
              targetId: id,
              createdAt: currentTimeVN,
              branch,
            },
          });

          await tx.user.update({
            where: { id: user.id },
            data: {
              stars: newStars,
              updatedAt: currentTimeVN,
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
