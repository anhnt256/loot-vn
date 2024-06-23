"use server";

import {db} from "@/lib/db";
import {createSafeAction} from "@/lib/create-safe-action";

import {CreateCheckInResult} from "./schema";
import {InputType, ReturnType} from "./type";
import dayjs, {nowUtc} from "@/lib/dayjs";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {userId, branch, currentUserId, addedStar} = data;
  let checkIn;

  // check user has check-in
  const startDate = dayjs().utc().add(7, "hour").startOf("day").toISOString();

  console.log("userId", userId);
  console.log("branch", branch);
  console.log("startDate", startDate);

  const checkInResult = await db.checkInResult.findFirst({
    where: {
      userId: userId,
      branch: branch,
      createdAt: {
        gte: startDate, // Check if createdAt is greater than or equal to today at 00:00:00
      },
    },
  });

  console.log("checkInResult", checkInResult);

  if (checkInResult) {
    return {
      error: "Bạn đã điểm danh rồi.",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      checkIn = await db.checkInResult.create({
        data: {
          userId,
          branch,
          createdAt: nowUtc,
        },
      });

      if (checkIn) {
        const {id} = checkIn;

        const user = await tx.user.findUnique({where: {id: currentUserId}});

        if (user) {
          const {stars: oldStars} = user;

          const newStars = oldStars + addedStar;

          await tx.userStarHistory.create({
            data: {
              userId,
              type: "CHECK_IN",
              oldStars,
              newStars,
              targetId: id,
              createdAt: nowUtc,
            },
          });

          await tx.user.update({
            where: {id: currentUserId},
            data: {
              stars: newStars,
              updatedAt: nowUtc,
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

  return {data: checkIn};
};

export const createCheckInResult = createSafeAction(
  CreateCheckInResult,
  handler,
);
