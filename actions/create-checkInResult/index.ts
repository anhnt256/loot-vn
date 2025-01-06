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

  // TODO: verify this code
  // const startDate = dayjs()
  //   .tz("Asia/Ho_Chi_Minh")
  //   .startOf("day")
  //   .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  // const endDate = dayjs()
  //   .tz("Asia/Ho_Chi_Minh")
  //   .endOf("day")
  //   .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  //
  // // const startDate = "2025-01-04T00:00:00.000+07:00";
  // // const endDate = "2025-01-04T23:59:59.999+07:00";
  //
  // const url = `/accounts/${userId}/balance_changes/?from_date=${encodeURIComponent(
  //   startDate,
  // )}&to_date=${encodeURIComponent(endDate)}&limit=4000`;
  //
  // const result = await apiClient({
  //   method: "get",
  //   url,
  //   headers: {
  //     "Content-Type": "application/json",
  //     Cookie: branch,
  //   },
  // });
  //
  // console.log("url", url);
  // console.log("branch", branch);
  //
  // const checkInItems = await db.checkInItem.findMany();
  //
  // console.log("result", result.data);
  //
  // const checkInResults = result.data.results;
  //
  // console.log("checkInResults", checkInResults);
  //
  // const totalPlayTime = checkTodaySpentTime(checkInResults);
  //
  // const today = dayjs().format("ddd");
  // const todayCheckIn = checkInItems.find((item) => item.dayName === today);
  // const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;
  //
  // const canClaim = totalPlayTime * starsPerHour;
  //
  // const userClaim = await db.userStarHistory.findMany({
  //   where: {
  //     userId: userId,
  //     branch: branch,
  //     type: "CHECK_IN",
  //     createdAt: {
  //       gte: startOfDayVN, // Check if createdAt is greater than or equal to today at 00:00:00
  //     },
  //   },
  // });
  //
  // const totalClaimed = userClaim.reduce((acc, item) => {
  //   const difference = (item.newStars ?? 0) - (item.oldStars ?? 0);
  //   return acc + difference;
  // }, 0);
  //
  // console.log("totalClaimed", totalClaimed);
  // console.log("canClaim", canClaim);
  //
  // if (totalClaimed >= canClaim) {
  //   return {
  //     error: "Bạn chưa có sao để nhận, hãy chơi thêm để nhận sao nhé!",
  //   };
  // }

  try {
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

        const user = await tx.user.findUnique({ where: { id: currentUserId } });

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
            where: { id: currentUserId },
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
