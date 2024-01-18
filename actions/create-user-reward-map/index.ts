"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUserRewardMap } from "./schema";
import { InputType } from "./type";
import { nowUtc } from "@/lib/dayjs";

const handler = async (data: InputType): Promise<any> => {
  const { userId, rewardId, duration = 7, isUsed = true, value, branch } = data;
  let createUserRewardMap;

  const promotion = await db.promotionCode.findFirst({
    where: { value, branch, isUsed: false },
  });

  const user = await db.user.findFirst({
    where: { userId, branch },
  });

  if (promotion && user) {
    const { stars } = user;
    if (stars - value < 0) {
      return {
        error: "Failed to create.",
      };
    }
    const { id } = promotion;

    await db.promotionCode.update({
      where: {
        id,
      },
      data: {
        isUsed: true,
        updatedAt: nowUtc,
      },
    });

    try {
      createUserRewardMap = await db.userRewardMap.create({
        data: {
          userId,
          rewardId,
          promotionCodeId: id,
          duration,
          isUsed,
          createdAt: nowUtc,
        },
      });
    } catch (error) {
      return {
        error: "Failed to create.",
      };
    }
  }

  return { data: createUserRewardMap };
};

export const createUserRewardMap = createSafeAction(
  CreateUserRewardMap,
  handler,
);
