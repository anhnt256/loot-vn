import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

export async function POST(request: Request) {
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

    // Get request body
    const body = await request.json();
    const { experience, totalSpent } = body;

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

    // Find or create user progress
    const existingProgress = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePass 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
      LIMIT 1
    `;

    let userProgress = existingProgress[0];

    if (!userProgress) {
      // Create new user progress
      await db.$executeRaw`
        INSERT INTO UserBattlePass (userId, seasonId, level, experience, isPremium, totalSpent, branch, createdAt, updatedAt)
        VALUES (${decoded.userId}, ${currentSeason.id}, 0, ${experience || 0}, false, ${totalSpent || 0}, 'GO_VAP', ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
      `;

      const newProgress = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
        LIMIT 1
      `;
      userProgress = newProgress[0];
    } else {
      // Update existing progress
      const newExperience =
        experience !== undefined ? experience : userProgress.experience;
      const newTotalSpent =
        totalSpent !== undefined ? totalSpent : userProgress.totalSpent;

      await db.$executeRaw`
        UPDATE UserBattlePass 
        SET experience = ${newExperience}, totalSpent = ${newTotalSpent}, updatedAt = ${getCurrentTimeVNDB()}
        WHERE id = ${userProgress.id}
      `;

      const updatedProgress = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE id = ${userProgress.id}
        LIMIT 1
      `;
      userProgress = updatedProgress[0];
    }

    return NextResponse.json({
      success: true,
      experience: userProgress.experience,
      level: userProgress.level,
      totalSpent: userProgress.totalSpent,
    });
  } catch (error) {
    console.error("Error updating battle pass progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
