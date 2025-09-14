import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: { rewardId: string } },
) {
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

    // Get branch from cookie - required for database operations
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const rewardId = parseInt(params.rewardId);
    if (isNaN(rewardId)) {
      return NextResponse.json({ error: "Invalid reward ID" }, { status: 400 });
    }

    // Get current active season
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

    // Get rewards for current season
    const rewards = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassReward 
      WHERE seasonId = ${currentSeason.id}
      ORDER BY level ASC
    `;

    currentSeason.rewards = rewards;

    // Double check - ensure season hasn't ended
    const currentDate = getCurrentTimeVNDB().split("T")[0];
    if (currentDate >= currentSeason.endDate) {
      return NextResponse.json(
        { error: "Season has ended - cannot claim rewards" },
        { status: 403 },
      );
    }

    // Get the reward
    const reward = currentSeason.rewards.find((r: any) => r.id === rewardId);
    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    // Get user progress
    const userProgressResult = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePass 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id} AND branch = ${branch}
      LIMIT 1
    `;

    const userProgress = userProgressResult[0];
    if (!userProgress) {
      return NextResponse.json(
        { error: "No progress found for this season" },
        { status: 404 },
      );
    }

    // Check if reward is already claimed
    const claimedRewardResult = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePassReward 
      WHERE userId = ${decoded.userId} AND rewardId = ${rewardId} AND branch = ${branch}
      LIMIT 1
    `;

    const claimedReward = claimedRewardResult[0];
    if (claimedReward) {
      return NextResponse.json(
        { error: "Reward already claimed" },
        { status: 400 },
      );
    }

    // Check if user meets XP requirement
    if (userProgress.experience < reward.experience) {
      return NextResponse.json(
        {
          error: `Not enough XP to claim this reward. Required: ${reward.experience}, Current: ${userProgress.experience}`,
        },
        { status: 400 },
      );
    }

    // Check if reward is VIP-only (premium type)
    if (reward.type === "premium" && !userProgress.isPremium) {
      return NextResponse.json(
        { error: "Premium required for this reward" },
        { status: 403 },
      );
    }

    // Use transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // Create claimed reward record
      await tx.$executeRaw`
        INSERT INTO UserBattlePassReward (userId, seasonId, rewardId, branch, claimedAt)
        VALUES (${decoded.userId}, ${currentSeason.id}, ${rewardId}, ${branch}, ${getCurrentTimeVNDB()})
      `;

      // Add stars to user and log to UserStarHistory
      if (reward.rewardType === "stars" && reward.rewardValue) {
        // Get current user stars
        const userResult = await tx.$queryRaw<any[]>`
          SELECT stars FROM User 
          WHERE userId = ${decoded.userId} AND branch = ${branch}
          LIMIT 1
        `;

        const currentUser = userResult[0];
        if (currentUser) {
          const oldStars = currentUser.stars;
          const newStars = oldStars + reward.rewardValue;

          // Update user stars
          await tx.$executeRaw`
            UPDATE User 
            SET stars = ${newStars}, updatedAt = ${getCurrentTimeVNDB()}
            WHERE userId = ${decoded.userId} AND branch = ${branch}
          `;

          // Log to UserStarHistory
          await tx.$executeRaw`
            INSERT INTO UserStarHistory (userId, oldStars, newStars, type, createdAt, branch)
            VALUES (${decoded.userId}, ${oldStars}, ${newStars}, 'BATTLE_PASS', ${getCurrentTimeVNDB()}, ${branch})
          `;
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Reward claimed successfully",
      reward,
      starsAdded: reward.rewardType === "stars" ? reward.rewardValue : 0,
    });
  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
