import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateLevel } from "@/lib/battle-pass-utils";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export async function GET(request: Request) {
  try {
    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get("user");
    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 401 });
    }

    const currentSeasons = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true
        AND startDate <= DATE(${getCurrentTimeVNISO()})
        AND endDate >= DATE(${getCurrentTimeVNISO()})
      LIMIT 1
    `;

    const currentSeason = currentSeasons[0];

    if (!currentSeason) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 },
      );
    }

    // Tìm hoặc tạo user battle pass progress
    const existingProgress = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePass 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
      LIMIT 1
    `;

    let userProgress = existingProgress[0];

    // Nếu chưa có progress, tạo mới với level được tính toán
    if (!userProgress) {
      // Tính toán level dựa trên experience (mặc định 0)
      const experience = 0;
      const calculatedLevel = calculateLevel(
        experience,
        currentSeason.maxLevel,
      );

      await db.$executeRaw`
        INSERT INTO UserBattlePass (userId, seasonId, level, experience, isPremium, totalSpent, branch, createdAt, updatedAt)
        VALUES (${decoded.userId}, ${currentSeason.id}, ${calculatedLevel}, ${experience}, false, 0, 'GO_VAP', ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()})
      `;

      const newProgress = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
        LIMIT 1
      `;
      userProgress = newProgress[0];
    }

    // Lấy danh sách rewards đã claim
    const claimedRewards = await db.$queryRaw<any[]>`
      SELECT rewardId FROM UserBattlePassReward 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
    `;

    const claimedRewardIds = claimedRewards.map((r) => r.rewardId);

    // Lấy tất cả rewards của season
    const allRewards = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassReward 
      WHERE seasonId = ${currentSeason.id}
      ORDER BY level ASC
    `;

    // availableRewards: chưa nhận, đủ điều kiện
    const availableRewards = allRewards.filter(
      (reward) =>
        !claimedRewardIds.includes(reward.id) &&
        userProgress.experience >= reward.experience,
    );

    return NextResponse.json({
      seasonId: currentSeason.id,
      isPremium: userProgress.isPremium,
      level: userProgress.level,
      experience: userProgress.experience,
      totalSpent: userProgress.totalSpent,
      claimedRewards: claimedRewardIds,
      rewards: allRewards,
      availableRewards,
      maxLevel: currentSeason.maxLevel,
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
