import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

export async function GET() {
  try {
    console.log("=== TEST SYNC API START ===");

    // Get current active season
    console.log("Getting current season...");
    const currentSeasons = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true
        AND startDate <= DATE('${getCurrentTimeVNDB()}')
        AND endDate >= DATE('${getCurrentTimeVNDB()}')
      LIMIT 1
    `;

    const currentSeason = currentSeasons[0];

    console.log("Current season:", currentSeason);

    if (!currentSeason) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 },
      );
    }

    // Test with a hardcoded user ID
    const testUserId = 1;

    // Find or create user progress
    console.log("Finding user progress for user ID:", testUserId);
    const existingProgress = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePass 
      WHERE userId = ${testUserId} AND seasonId = ${currentSeason.id}
      LIMIT 1
    `;

    let userProgress = existingProgress[0];
    console.log("Existing user progress:", userProgress);

    if (!userProgress) {
      console.log("Creating new user progress...");
      // Create new user progress
      await db.$executeRaw`
        INSERT INTO UserBattlePass (userId, seasonId, level, experience, isPremium, totalSpent, branch, createdAt, updatedAt)
        VALUES (${testUserId}, ${currentSeason.id}, 1, 0, false, 0, 'GO_VAP', '${getCurrentTimeVNDB()}', '${getCurrentTimeVNDB()}')
      `;

      const newProgress = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${testUserId} AND seasonId = ${currentSeason.id}
        LIMIT 1
      `;
      userProgress = newProgress[0];
      console.log("Created user progress:", userProgress);
    }

    const response = {
      success: true,
      season: currentSeason,
      userProgress: userProgress,
    };

    console.log("Response:", response);
    console.log("=== TEST SYNC API END ===");

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in test sync:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
