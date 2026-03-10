import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { calculateLevel } from "@/lib/battle-pass-utils";

interface CreateUserBattlePassParams {
  userId: number;
  seasonId: number;
  branch: string;
  maxLevel: number;
  initialExperience?: number;
  initialLevel?: number;
}

/**
 * Tạo hoặc lấy UserBattlePass với Redis lock để tránh race condition
 * Đảm bảo chỉ có 1 record duy nhất cho (userId, seasonId, branch)
 */
export async function getOrCreateUserBattlePass(
  params: CreateUserBattlePassParams,
): Promise<any> {
  const {
    userId,
    seasonId,
    branch,
    maxLevel,
    initialExperience,
    initialLevel,
  } = params;

  // Tạo lock key duy nhất cho user + season + branch
  const lockKey = `battle_pass_lock:${userId}:${seasonId}:${branch}`;
  const lockValue = `${Date.now()}`; // Unique value để release đúng lock
  const lockTTL = 10; // 10 seconds timeout

  try {
    // Step 1: Check xem đã có record chưa (fast path)
    let userProgressResult = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePass 
      WHERE userId = ${userId} AND seasonId = ${seasonId} AND branch = ${branch}
      LIMIT 1
    `;

    if (userProgressResult.length > 0) {
      console.log(
        `UserBattlePass already exists for user ${userId}, season ${seasonId}, branch ${branch}`,
      );
      return userProgressResult[0];
    }

    // Step 2: Acquire Redis lock (SET NX EX)
    const lockAcquired = await redis.set(
      lockKey,
      lockValue,
      "EX",
      lockTTL,
      "NX",
    );

    if (!lockAcquired) {
      // Lock không lấy được, có request khác đang xử lý
      console.log(
        `Lock not acquired for user ${userId}, waiting for other request...`,
      );

      // Đợi một chút rồi query lại (request khác đã tạo xong)
      await new Promise((resolve) => setTimeout(resolve, 500));

      userProgressResult = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${userId} AND seasonId = ${seasonId} AND branch = ${branch}
        LIMIT 1
      `;

      if (userProgressResult.length > 0) {
        return userProgressResult[0];
      }

      // Nếu vẫn chưa có, throw error
      throw new Error(
        "Failed to create UserBattlePass: concurrent request timeout",
      );
    }

    try {
      // Step 3: Double check trong lock (để chắc chắn)
      userProgressResult = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${userId} AND seasonId = ${seasonId} AND branch = ${branch}
        LIMIT 1
      `;

      if (userProgressResult.length > 0) {
        console.log(
          `UserBattlePass created by another request while acquiring lock`,
        );
        return userProgressResult[0];
      }

      // Step 4: Tạo mới UserBattlePass
      const experience = initialExperience ?? 0;
      const level = initialLevel ?? calculateLevel(experience, maxLevel);
      const now = getCurrentTimeVNDB();

      console.log(
        `Creating UserBattlePass for user ${userId}, season ${seasonId}, branch ${branch}`,
      );

      await db.$executeRawUnsafe(
        `
        INSERT INTO UserBattlePass (userId, seasonId, level, experience, isPremium, totalSpent, branch, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, false, 0, ?, ?, ?)
      `,
        userId,
        seasonId,
        level,
        experience,
        branch,
        now,
        now,
      );

      // Step 5: Lấy lại record vừa tạo
      userProgressResult = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${userId} AND seasonId = ${seasonId} AND branch = ${branch}
        LIMIT 1
      `;

      if (userProgressResult.length === 0) {
        throw new Error("Failed to retrieve created UserBattlePass");
      }

      console.log(`UserBattlePass created successfully for user ${userId}`);
      return userProgressResult[0];
    } finally {
      // Step 6: Release lock (chỉ release nếu đúng lockValue)
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(script, 1, lockKey, lockValue);
    }
  } catch (error: any) {
    console.error("Error in getOrCreateUserBattlePass:", error);

    // Nếu lỗi duplicate (bất ngờ), vẫn cố gắng lấy record
    if (error.code === "ER_DUP_ENTRY" || error.code === "23000") {
      console.log("Duplicate entry detected, fetching existing record");
      const userProgressResult = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${userId} AND seasonId = ${seasonId} AND branch = ${branch}
        LIMIT 1
      `;

      if (userProgressResult.length > 0) {
        return userProgressResult[0];
      }
    }

    throw error;
  }
}
