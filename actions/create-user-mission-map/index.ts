"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUserMissionMap } from "./schema";
import { InputType, ReturnType } from "./type";
import dayjs from "@/lib/dayjs";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, missionId, branch } = data;
  let createUserMissionMap;

  const currentMissions = await db.userMissionMap.findMany({
    where: { userId },
  });

  if (currentMissions.length >= 5 && dayjs().isToday()) {
    return {
      error: "Mission has full.",
    };
  }

  try {
    createUserMissionMap = await db.userMissionMap.create({
      data: {
        userId,
        missionId,
        branch,
      },
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: createUserMissionMap };
};

export const createUserMissionMap = createSafeAction(
  CreateUserMissionMap,
  handler,
);
