import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export async function POST(request: Request) {
  try {
    console.log("=== SYNC PROGRESS API START ===");

    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get("user");
    console.log("User header:", userHeader);

    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);
    console.log("Decoded user:", decoded);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 401 });
    }

    // Get current active season
    console.log("Getting current season...");
    const currentSeasons = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true
        AND startDate <= DATE(${getCurrentTimeVNISO()})
        AND endDate >= DATE(${getCurrentTimeVNISO()})
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

    // Find user progress
    console.log("Finding user progress...");
    const existingProgress = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePass 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
      LIMIT 1
    `;

    let userProgress = existingProgress[0];
    console.log("Existing user progress:", userProgress);

    if (!userProgress) {
      console.log("Creating new user progress...");
      // Create new user progress with default values
      await db.$executeRaw`
        INSERT INTO UserBattlePass (userId, seasonId, level, experience, isPremium, totalSpent, branch, createdAt, updatedAt)
        VALUES (${decoded.userId}, ${currentSeason.id}, 0, 0, false, 0, 'GO_VAP', ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()})
      `;

      const newProgress = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
        LIMIT 1
      `;
      userProgress = newProgress[0];
      console.log("Created user progress:", userProgress);
    }

    const response = {
      success: true,
      experience: userProgress.experience,
      level: userProgress.level,
      totalSpent: userProgress.totalSpent,
    };

    console.log("Response:", response);
    console.log("=== SYNC PROGRESS API END ===");

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error syncing battle pass progress:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
