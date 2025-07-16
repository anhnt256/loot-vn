import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateLevel } from "@/lib/battle-pass-utils";
import { getCurrentDateVN } from "@/lib/timezone-utils";

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

    // Convert userId to number for Prisma
    const userId = parseInt(decoded.userId.toString(), 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const currentSeason = await db.battlePassSeason.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: getCurrentDateVN(),
        },
        endDate: {
          gte: getCurrentDateVN(),
        },
      },
    });

    if (!currentSeason) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 },
      );
    }

    // Tìm hoặc tạo user battle pass progress
    let userProgress = await db.userBattlePass.findFirst({
      where: {
        userId: userId,
        seasonId: currentSeason.id,
      },
    });

    // Nếu chưa có progress, tạo mới với level được tính toán
    if (!userProgress) {
      // Tính toán level dựa trên experience (mặc định 0)
      const experience = 0;
      const calculatedLevel = calculateLevel(
        experience,
        currentSeason.maxLevel,
      );

      userProgress = await db.userBattlePass.create({
        data: {
          userId: userId,
          seasonId: currentSeason.id,
          level: calculatedLevel,
          experience: experience,
          isPremium: false,
          totalSpent: 0,
          branch: "GO_VAP", // Default branch
        },
      });
    }

    // Lấy danh sách rewards đã claim
    const claimedRewards = await db.userBattlePassReward.findMany({
      where: {
        userId: userId,
        seasonId: currentSeason.id,
      },
      select: {
        rewardId: true,
      },
    });

    const claimedRewardIds = claimedRewards.map((r) => r.rewardId);

    // Lấy tất cả rewards của season
    const allRewards = await db.battlePassReward.findMany({
      where: { seasonId: currentSeason.id },
      orderBy: { level: "asc" },
    });

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
