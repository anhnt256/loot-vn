"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateCheckInResult } from "./schema";
import { InputType, ReturnType } from "./type";
import { nowUtc } from "@/lib/dayjs";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, branch, currentUserId, addedStar } = data;
  let checkIn;

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
              createdAt: nowUtc,
            },
          });

          await tx.user.update({
            where: { id: currentUserId },
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

  return { data: checkIn };
};

export const createCheckInResult = createSafeAction(
  CreateCheckInResult,
  handler,
);
