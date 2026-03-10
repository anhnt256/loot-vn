import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateLevel } from "@/lib/battle-pass-utils";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { cookies } from "next/headers";
import { getOrCreateUserBattlePass } from "@/lib/battle-pass-creation";

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

    // Get branch from cookie
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const currentSeasons = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true
        AND startDate <= DATE(${getCurrentTimeVNDB()})
        AND endDate >= DATE(${getCurrentTimeVNDB()})
      LIMIT 1
    `;

    const currentSeason = currentSeasons[0];

    if (!currentSeason) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 },
      );
    }

    // Tìm hoặc tạo user battle pass progress với Redis lock
    const userProgress = await getOrCreateUserBattlePass({
      userId: decoded.userId,
      seasonId: currentSeason.id,
      branch,
      maxLevel: currentSeason.maxLevel,
      initialExperience: 0,
    });

    if (!userProgress) {
      return NextResponse.json(
        { error: "Failed to create or retrieve user progress" },
        { status: 500 },
      );
    }

    // Check if user has pending premium order
    const pendingOrderResult = await db.$queryRaw<any[]>`
      SELECT o.id, o.createdAt, o.price
      FROM BattlePassPremiumOrder o
      INNER JOIN BattlePassPremiumPackage p ON o.packageId = p.id
      WHERE o.userId = ${decoded.userId}
        AND o.branch = ${branch}
        AND p.seasonId = ${currentSeason.id}
        AND o.status = 'PENDING'
      LIMIT 1
    `;

    const hasPendingOrder = pendingOrderResult.length > 0;
    const pendingOrder = hasPendingOrder
      ? {
          id: Number(pendingOrderResult[0].id),
          createdAt: pendingOrderResult[0].createdAt,
          price: Number(pendingOrderResult[0].price),
        }
      : null;

    // Lấy danh sách rewards đã claim
    const claimedRewards = await db.$queryRaw<any[]>`
      SELECT rewardId FROM UserBattlePassReward 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id} AND branch = ${branch}
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
      hasPendingOrder,
      pendingOrder,
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
