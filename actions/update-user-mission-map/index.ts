"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateUserMissionMap } from "./schema";
import { InputType, ReturnType } from "./type";
import { nowUtc, startUtc } from "@/lib/dayjs";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    id,
    isDone = true,
    updatedAt = nowUtc,
    userId,
    stars,
    oldStars,
  } = data;
  let updateUserMissionMap;
  let updateUser;

  const currentMissions = await db.userMissionMap.findFirst({
    where: { id, isDone: true },
  });

  if (currentMissions) {
    return {
      error: "Reward has claim.",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      updateUserMissionMap = await tx.userMissionMap.update({
        where: {
          id,
        },
        data: {
          isDone,
          updatedAt,
        },
      });
      if (updateUserMissionMap) {
        updateUser = await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            stars,
            updatedAt,
          },
        });

        await tx.userStarHistory.create({
          data: {
            userId,
            type: "MISSION",
            oldStars,
            newStars: stars,
            targetId: id,
            createdAt: nowUtc,
          },
        });
      }
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: updateUserMissionMap };
};

export const updateUserMissionMap = createSafeAction(
  UpdateUserMissionMap,
  handler,
);
