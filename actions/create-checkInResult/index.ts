"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateCheckInResult } from "./schema";
import { InputType, ReturnType } from "./type";
import dayjs, { currentTimeVN, startOfDayVN } from "@/lib/dayjs";
import apiClient from "@/lib/apiClient";
import { checkTodaySpentTime } from "@/lib/utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, branch, currentUserId, addedStar } = data;
  let checkIn;

  try {
    // TODO: verify this code
    const startDate = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .startOf("day")
      .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    const endDate = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .endOf("day")
      .format("YYYY-MM-DDTHH:mm:ss.SSSZ");

    // const startDate = "2025-01-04T00:00:00.000+07:00";
    // const endDate = "2025-01-04T23:59:59.999+07:00";

    const url = `/accounts/${currentUserId}/balance_changes/?from_date=${encodeURIComponent(
      startDate,
    )}&to_date=${encodeURIComponent(endDate)}&limit=4000`;

    const result = await apiClient({
      method: "get",
      url,
      headers: {
        "Content-Type": "application/json",
        Cookie: branch,
      },
    });

    const checkInItems = await db.checkInItem.findMany();

    const checkInResults = result.data.results;

    const totalPlayTime = checkTodaySpentTime(checkInResults);

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
          where: { userId: currentUserId, branch },
        });

        if (user) {
          const { stars: oldStars } = user;

          const newStars = oldStars + addedStar;

          await tx.userStarHistory.create({
            data: {
              userId: currentUserId,
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
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: checkIn };
};

export const createCheckInResult = createSafeAction(
  CreateCheckInResult,
  handler,
);
