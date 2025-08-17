"use server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateUserRewardMap } from "./schema";
import { InputType } from "./type";
import dayjs from "@/lib/dayjs";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

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

  // Verify user exists with correct userId and branch first using raw SQL
  const users = await db.$queryRaw`
    SELECT * FROM User 
    WHERE userId = ${userId} AND branch = ${branch}
    LIMIT 1
  `;
  const user = (users as any[])[0];
  
  if (!user) {
    return {
      error: `User with userId ${userId} and branch ${branch} not found`,
    };
  }

  // Kiểm tra user có nhiều tài khoản hoặc tài khoản không giống với Fnet
  const allUserAccounts = await db.$queryRaw`
    SELECT * FROM User 
    WHERE userId = ${userId}
    ORDER BY createdAt DESC
  `;
  
  if ((allUserAccounts as any[]).length > 1) {
    return {
      error: "Tài khoản của bạn đã được sử dụng ở nhiều nơi. Vui lòng liên hệ admin để được hỗ trợ.",
    };
  }

  // Kiểm tra tài khoản hiện tại có giống với Fnet không
  try {
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();
    
    // Kiểm tra user có tồn tại trong Fnet database không
    const fnetUserCount = await fnetDB.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM fnet.systemlogtb 
      WHERE userId = ${userId}
    `;
    
    if (fnetUserCount[0].count === 0) {
      return {
        error: "Tài khoản không tồn tại trong hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.",
      };
    }
    
    // Kiểm tra user có nhiều tài khoản trong Fnet không
    if (fnetUserCount[0].count > 1) {
      return {
        error: "Tài khoản của bạn đã được sử dụng ở nhiều nơi trong hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.",
      };
    }
    
    // Kiểm tra user có session gần đây trong Fnet không (để đảm bảo tài khoản còn hoạt động)
    const recentSession = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
      SELECT * FROM fnet.systemlogtb 
      WHERE userId = ${userId} 
      ORDER BY LogTime DESC 
      LIMIT 1
    `);
    
    if (!recentSession[0]) {
      return {
        error: "Không tìm thấy hoạt động gần đây của tài khoản trong hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.",
      };
    }
    
  } catch (error) {
    console.log("Error checking Fnet database:", error);
    return {
      error: "Không thể kiểm tra thông tin tài khoản với hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.",
    };
  }

  // Kiểm tra số sao thực tế từ database
  if (user.stars < value) {
    return {
      error: `User chỉ có ${user.stars.toLocaleString()} sao, không đủ để đổi thưởng này (cần ${value.toLocaleString()} sao).`,
    };
  }

  // Kiểm tra xem user có đang có yêu cầu đổi thưởng đang chờ duyệt không
  const pendingRewardExchanges = await db.$queryRaw`
    SELECT * FROM UserRewardMap 
    WHERE userId = ${user.id} AND branch = ${branch} AND status = 'INITIAL'
    LIMIT 1
  `;
  const pendingRewardExchange = (pendingRewardExchanges as any[])[0];

  if (pendingRewardExchange) {
    return {
      error: "Bạn đang có yêu cầu đổi thưởng đang chờ duyệt. Vui lòng đợi admin xử lý xong trước khi đổi thưởng tiếp.",
    };
  }

  // Tìm reward trước để lấy name
  const rewards = await db.$queryRaw`
    SELECT * FROM Reward WHERE id = ${rewardId}
  `;
  const reward = (rewards as any[])[0];

  if (!reward) {
    return {
      error: "Reward không tồn tại.",
    };
  }

  // Tìm promotionCode hợp lệ - tìm theo name của reward và branch
  const promotions = await db.$queryRaw`
    SELECT * FROM PromotionCode 
    WHERE name = ${reward.name} AND branch = ${branch} AND isUsed = false
    LIMIT 1
  `;
  const promotion = (promotions as any[])[0];

  console.log("promotion found:", promotion);

  if (promotion) {
    try {
      await db.$transaction(async (tx) => {
        const { id } = promotion;
        console.log("Updating promotionCode with id:", id);
        
        // Update promotionCode: set isUsed = true
        await tx.$executeRaw`
          UPDATE PromotionCode 
          SET isUsed = true, updatedAt = ${getCurrentTimeVNISO()}
          WHERE id = ${id}
        `;
        
        console.log("Creating userRewardMap...");
        // Insert vào userRewardMap với internal id của user để relation đúng
        await tx.$executeRaw`
          INSERT INTO UserRewardMap (userId, rewardId, promotionCodeId, duration, isUsed, branch, createdAt, updatedAt)
          VALUES (${user.id}, ${rewardId}, ${id}, ${duration}, ${isUsed}, ${branch}, ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()})
        `;
        
        // Get the inserted record ID
        const userRewardMapResults = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id`;
        const userRewardMapId = (userRewardMapResults as any[])[0]?.id;
        
        // Get the full userRewardMap record
        const userRewardMapRecords = await tx.$queryRaw`
          SELECT * FROM UserRewardMap WHERE id = ${userRewardMapId}
        `;
        createUserRewardMap = (userRewardMapRecords as any[])[0];
        
        console.log("userRewardMap created:", createUserRewardMap);
        
        // Update số sao trong table User
        await tx.$executeRaw`
          UPDATE User 
          SET stars = ${newStars}, updatedAt = ${getCurrentTimeVNISO()}
          WHERE id = ${user.id}
        `;
        
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
