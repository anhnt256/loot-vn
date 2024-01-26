"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUserRewardMap } from "./schema";
import { InputType } from "./type";
import { nowUtc } from "@/lib/dayjs";

const handler = async (data: InputType): Promise<any> => {
  const {
    currentUserId,
    userId,
    rewardId,
    duration = 7,
    isUsed = true,
    value,
    branch,
    newStars,
  } = data;
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

    try {
      await db.$transaction(async (tx) => {
        const { id } = promotion;
        await tx.promotionCode.update({
          where: {
            id,
          },
          data: {
            isUsed: true,
            updatedAt: nowUtc,
          },
        });

        createUserRewardMap = await tx.userRewardMap.create({
          data: {
            userId,
            rewardId,
            promotionCodeId: id,
            duration,
            isUsed,
            createdAt: nowUtc,
          },
        });

        if (createUserRewardMap) {
          return tx.user.update({
            where: {
              id: currentUserId,
            },
            data: {
              stars: newStars,
              updatedAt: nowUtc,
            },
          });
        }
      });
    } catch (error) {
      console.log("error", error);
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
