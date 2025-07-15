"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateUserRewardMap } from "./schema";
import { InputType } from "./type";
import dayjs from "@/lib/dayjs";
import { getVNTimeForPrisma } from "@/lib/timezone-utils";

const expirationDuration = 1;

const handler = async (data: InputType): Promise<any> => {
  const {
    userId,
    rewardId,
    duration = 7,
    isUsed = true,
    value,
    oldStars,
    newStars,
    branch,
    createdAt,
  } = data;

  console.log("=== createUserRewardMap action called ===");
  console.log("data", data);
  console.log("userId:", userId);
  console.log("rewardId:", rewardId);
  console.log("value:", value);
  console.log("branch:", branch);

  let createUserRewardMap;

  // Verify user exists with correct userId and branch first
  const user = await db.user.findFirst({
    where: {
      userId: userId,
      branch: branch
    }
  });
  
  if (!user) {
    return {
      error: `User with userId ${userId} and branch ${branch} not found`,
    };
  }

  // Kiểm tra số sao thực tế từ database
  if (user.stars < value) {
    return {
      error: `User chỉ có ${user.stars.toLocaleString()} sao, không đủ để đổi thưởng này (cần ${value.toLocaleString()} sao).`,
    };
  }

  // Kiểm tra xem user có đang có yêu cầu đổi thưởng đang chờ duyệt không
  const pendingRewardExchange = await db.userRewardMap.findFirst({
    where: {
      userId: user.id,
      branch: branch,
      status: "INITIAL", // Chỉ kiểm tra những yêu cầu đang chờ duyệt
    },
  });

  if (pendingRewardExchange) {
    return {
      error: "Bạn đang có yêu cầu đổi thưởng đang chờ duyệt. Vui lòng đợi admin xử lý xong trước khi đổi thưởng tiếp.",
    };
  }

  // Tìm reward trước để lấy name
  const reward = await db.reward.findUnique({
    where: { id: rewardId }
  });

  if (!reward) {
    return {
      error: "Reward không tồn tại.",
    };
  }

  // Tìm promotionCode hợp lệ - tìm theo name của reward và branch
  const promotion = await db.promotionCode.findFirst({
    where: { 
      name: reward.name,
      branch: branch, 
      isUsed: false 
    },
  });

  console.log("promotion found:", promotion);

  if (promotion) {
    try {
      await db.$transaction(async (tx) => {
        const { id } = promotion;
        console.log("Updating promotionCode with id:", id);
        
        // Update promotionCode: set isUsed = true
        await tx.promotionCode.update({
          where: { id },
          data: {
            isUsed: true,
            updatedAt: getVNTimeForPrisma(),
          },
        });
        
        console.log("Creating userRewardMap...");
        // Insert vào userRewardMap với internal id của user để relation đúng
        createUserRewardMap = await tx.userRewardMap.create({
          data: {
            userId: user.id, // Sử dụng internal id của user để relation đúng
            rewardId,
            promotionCodeId: id,
            duration,
            isUsed,
            branch,
            createdAt: getVNTimeForPrisma(),
          },
        });
        
        console.log("userRewardMap created:", createUserRewardMap);
        
        // Update số sao trong table User
        await tx.user.update({
          where: { id: user.id },
          data: {
            stars: newStars,
            updatedAt: getVNTimeForPrisma(),
          },
        });
        
        console.log(`Updated user stars from ${oldStars} to ${newStars}`);
      });
    } catch (error) {
      console.log("=== ERROR in createUserRewardMap ===");
      console.log("error", error);
      return {
        error: "Failed to create.",
      };
    }
  } else {
    console.log("No valid promotion code found");
    return {
      error: "Promotion code không hợp lệ hoặc đã sử dụng.",
    };
  }

  console.log("=== createUserRewardMap action completed ===");
  return { data: createUserRewardMap };
};

export const createUserRewardMap = createSafeAction(
  CreateUserRewardMap,
  handler,
);
