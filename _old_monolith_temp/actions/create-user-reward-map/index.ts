"use server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateUserRewardMap } from "./schema";
import { InputType } from "./type";
import dayjs from "@/lib/dayjs";
import { getCurrentTimeVNISO, getCurrentTimeVNDB } from "@/lib/timezone-utils";

const expirationDuration = 1;

const handler = async (data: InputType): Promise<any> => {
  const {
    userId,
    rewardId,
    duration = 7,
    isUsed: isUsedParam = true,
    value,
    oldStars: oldStarsParam,
    newStars: newStarsParam,
    branch,
    createdAt,
  } = data;

  console.log("=== createUserRewardMap action called ===");
  console.log("data", data);
  console.log("userId:", userId);
  console.log("rewardId:", rewardId);
  console.log("value:", value);
  console.log("branch:", branch);

  // Validate rewardId
  if (!rewardId || typeof rewardId !== 'number' || rewardId <= 0) {
    console.error("Invalid rewardId:", rewardId);
    return {
      error: "Invalid reward ID",
    };
  }

  // Validate other required fields
  if (typeof newStarsParam !== 'number' || typeof oldStarsParam !== 'number') {
    console.error("Invalid stars values:", { newStars: newStarsParam, oldStars: oldStarsParam });
    return {
      error: "Invalid stars values",
    };
  }

  if (typeof duration !== 'number' || duration <= 0) {
    console.error("Invalid duration:", duration);
    return {
      error: "Invalid duration",
    };
  }

  if (typeof isUsedParam !== 'boolean') {
    console.error("Invalid isUsed:", isUsedParam);
    return {
      error: "Invalid isUsed value",
    };
  }

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
    WHERE userId = ${userId} AND branch = ${branch}
    ORDER BY createdAt DESC
  `;
  

  console.log('allUserAccounts------', allUserAccounts)

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
      SELECT COUNT(*) as count FROM fnet.usertb 
      WHERE UserId = ${userId}
    `;
    
    if (fnetUserCount[0].count === 0) {
      return {
        error: "Tài khoản không tồn tại trong hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.",
      };
    }

    console.log('fnetUserCount', fnetUserCount)
    
    // Kiểm tra user có nhiều tài khoản trong Fnet không
    if (fnetUserCount[0].count > 1) {
      return {
        error: "Tài khoản của bạn đã được sử dụng ở nhiều nơi trong hệ thống Fnet. Vui lòng liên hệ admin để được hỗ trợ.",
      };
    }
    
    // Kiểm tra user có session gần đây trong Fnet không (để đảm bảo tài khoản còn hoạt động)
    // Follow cấu trúc từ user-calculator.ts: JOIN systemlogtb với usertb
    const recentSession = await fnetDB.$queryRaw<any[]>`
      SELECT 
        s.UserId,
        s.EnterDate,
        s.EndDate,
        s.EnterTime,
        s.EndTime,
        s.status,
        u.UserType,
        s.MachineName
      FROM fnet.systemlogtb s
      JOIN usertb u ON s.UserId = u.UserId
      WHERE s.UserId = ${userId}
        AND s.status = 3
      ORDER BY s.EnterDate DESC, s.EnterTime DESC
      LIMIT 1
    `;
    
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

  // Tính toán stars cần thiết và mới (sẽ được cập nhật sau khi tìm promotionReward)
  let oldStars = user.stars;
  let newStars = user.stars;

  // Kiểm tra xem user có đang có yêu cầu đổi thưởng đang chờ duyệt không
  const pendingRewardExchanges = await db.$queryRaw`
    SELECT * FROM UserRewardMap 
    WHERE userId = ${user.userId} AND branch = ${branch} AND status = 'INITIAL'
    LIMIT 1
  `;
  const pendingRewardExchange = (pendingRewardExchanges as any[])[0];

  if (pendingRewardExchange) {
    return {
      error: "Bạn đang có yêu cầu đổi thưởng đang chờ duyệt. Vui lòng đợi admin xử lý xong trước khi đổi thưởng tiếp.",
    };
  }

  // Tìm promotion reward từ PromotionReward table
  const promotionRewards = await db.$queryRaw`
    SELECT * FROM PromotionReward 
    WHERE id = ${rewardId} AND branch = ${branch} AND isActive = true
    LIMIT 1
  `;
  const promotionReward = (promotionRewards as any[])[0];

  if (!promotionReward) {
    return {
      error: "Promotion reward không tồn tại hoặc đã bị vô hiệu hóa.",
    };
  }

  // Kiểm tra số lượng còn lại
  if (promotionReward.quantity <= 0) {
    return {
      error: "Thẻ cào này đã hết hàng.",
    };
  }

  // Kiểm tra số sao cần thiết
  if (user.stars < promotionReward.starsValue) {
    return {
      error: `User chỉ có ${user.stars.toLocaleString()} sao, không đủ để đổi thưởng này (cần ${promotionReward.starsValue.toLocaleString()} sao).`,
    };
  }

  // Cập nhật stars sau khi trừ đi
  newStars = oldStars - promotionReward.starsValue;

  try {
    await db.$transaction(async (tx) => {
      // Giảm số lượng promotion reward
      await tx.$executeRaw`
        UPDATE PromotionReward 
        SET quantity = quantity - 1, updatedAt = ${getCurrentTimeVNDB()}
        WHERE id = ${rewardId}
      `;
      
      console.log("Creating userRewardMap...");
        // Insert vào userRewardMap với promotionCodeId (sử dụng rewardId làm promotionCodeId)
        await tx.$executeRaw`
          INSERT INTO UserRewardMap (userId, rewardId, promotionCodeId, duration, isUsed, branch, createdAt, updatedAt)
          VALUES (${user.userId}, ${rewardId}, ${rewardId}, ${duration}, ${isUsedParam}, ${branch}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
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
      
      // Lấy số dư Fnet hiện tại từ database Fnet (wallettb)
      const fnetDB = await getFnetDB();
      const walletResult = await fnetDB.$queryRaw<any[]>`
        SELECT main, sub FROM wallettb 
        WHERE userid = ${user.userId}
        LIMIT 1
      `;
      
      if (walletResult.length === 0) {
        throw new Error(`Wallet not found for userId: ${user.userId}`);
      }
      
      const oldMain = Number(walletResult[0].main) || 0;
      const oldSub = Number(walletResult[0].sub) || 0;
      const newSub = oldSub + promotionReward.value;
      const newMain = oldMain; // Main không đổi
      
      console.log(`[createUserRewardMap] Wallet snapshot - oldMain: ${oldMain}, newMain: ${newMain}, oldSub: ${oldSub}, newSub: ${newSub}`);
      
      // Lưu FnetHistory khi tạo request (chỉ lưu 1 lần, khi approve sẽ không lưu lại)
      // Lưu snapshot đầy đủ của cả main và sub
      await tx.$executeRaw`
        INSERT INTO FnetHistory (userId, branch, oldSubMoney, newSubMoney, oldMainMoney, newMainMoney, moneyType, targetId, type, createdAt, updatedAt)
        VALUES (${user.userId}, ${branch}, ${oldSub}, ${newSub}, ${oldMain}, ${newMain}, 'SUB', ${userRewardMapId}, 'REWARD', ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
      `;
      
      // Update số sao trong table User
      await tx.$executeRaw`
        UPDATE User 
        SET stars = ${newStars}, updatedAt = ${getCurrentTimeVNDB()}
        WHERE id = ${user.id} AND branch = ${branch}
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

  console.log("=== createUserRewardMap action completed ===");
  return { data: createUserRewardMap };
};

export const createUserRewardMap = createSafeAction(
  CreateUserRewardMap,
  handler,
);
