"use server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateUserRewardMap } from "./schema";
import { InputType } from "./type";
import dayjs from "dayjs";

const handler = async (data: InputType): Promise<any> => {
  const {
    currentUserId,
    userId,
    rewardId,
    duration = 7,
    isUsed = true,
    value,
    branch,
    oldStars,
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

    const fnetDB = await getFnetDB();

    try {
      await db.$transaction(async (tx) => {
        const { id } = promotion;

        await tx.promotionCode.update({
          where: {
            id,
          },
          data: {
            isUsed: false,
            updatedAt: dayjs()
              .tz("Asia/Ho_Chi_Minh")
              .add(7, "hours")
              .toISOString(),
          },
        });

        const fnetUser = await fnetDB.usertb.findFirst({
          where: {
            UserId: userId,
          },
          select: {
            UserId: true,
            RemainMoney: true,
            Birthdate: true,
            ExpiryDate: true,
          },
        });

        if (fnetUser) {
          await fnetDB.usertb.update({
            where: {
              UserId: userId,
            },
            data: {
              RemainMoney: Number(fnetUser.RemainMoney) + Number(value),
              Birthdate:  fnetUser.Birthdate || null,
              ExpiryDate: fnetUser.ExpiryDate || null,
            },
          });
        }

        createUserRewardMap = await tx.userRewardMap.create({
          data: {
            userId,
            rewardId,
            promotionCodeId: id,
            duration,
            isUsed,
            branch,
            createdAt: dayjs()
              .tz("Asia/Ho_Chi_Minh")
              .add(7, "hours")
              .toISOString(),
          },
        });

        if (createUserRewardMap) {
          await tx.user.update({
            where: {
              id: currentUserId,
            },
            data: {
              stars: newStars,
              updatedAt: dayjs()
                .tz("Asia/Ho_Chi_Minh")
                .add(7, "hours")
                .toISOString(),
            },
          });

          await tx.userStarHistory.create({
            data: {
              userId,
              type: "REWARD",
              oldStars,
              newStars,
              targetId: rewardId,
              createdAt: dayjs()
                .tz("Asia/Ho_Chi_Minh")
                .add(7, "hours")
                .toISOString(),
              branch,
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
