"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUserMissionMap } from "./schema";
import { InputType } from "./type";
import dayjs from "@/lib/dayjs";

const startOfDayVN = dayjs()
  .tz("Asia/Ho_Chi_Minh")
  .startOf("day")
  .toISOString();

const handler = async (data: InputType): Promise<any> => {
  let createUserMissionMap;

  const { userId, branch } = data[0];

  const currentMissions = await db.userMissionMap.findMany({
    where: { userId, branch, createdAt: { gt: startOfDayVN } },
  });

  if (currentMissions.length >= 5 && dayjs().isToday()) {
    return {
      error: "Mission has full.",
    };
  }

  try {
    createUserMissionMap = await db.userMissionMap.createMany({
      data,
      skipDuplicates: true,
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: createUserMissionMap.count };
};

export const createUserMissionMap = createSafeAction(
  CreateUserMissionMap,
  handler,
);
