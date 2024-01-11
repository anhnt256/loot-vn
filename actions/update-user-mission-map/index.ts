"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateUserMissionMap } from "./schema";
import { InputType, ReturnType } from "./type";
import { nowUtc, startUtc } from "@/lib/dayjs";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, isDone = true, updatedAt = nowUtc } = data;
  let updateUserMissionMap;

  const currentMissions = await db.userMissionMap.findFirst({
    where: { id, isDone: true },
  });

  if (currentMissions) {
    return {
      error: "Reward has claim.",
    };
  }

  try {
    updateUserMissionMap = await db.userMissionMap.update({
      where: {
        id,
      },
      data: {
        isDone,
        updatedAt,
      },
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
