import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { cookies } from "next/headers";
import { calculateLevel } from "@/lib/battle-pass-utils";
import { getOrCreateUserBattlePass } from "@/lib/battle-pass-creation";

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

    // Get branch from cookie
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
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

    // Find or create user progress với Redis lock
    let userProgress = await getOrCreateUserBattlePass({
      userId: decoded.userId,
      seasonId: currentSeason.id,
      branch,
      maxLevel: currentSeason.maxLevel,
      initialExperience: experience || 0,
      initialLevel: undefined, // Let it calculate from experience
    });

    // Update existing progress if needed
    const newExperience =
      experience !== undefined ? experience : userProgress.experience;
    const newTotalSpent =
      totalSpent !== undefined ? totalSpent : userProgress.totalSpent;
    const newLevel = calculateLevel(newExperience, currentSeason.maxLevel);

    // Only update if values changed
    if (
      newExperience !== userProgress.experience ||
      newTotalSpent !== userProgress.totalSpent ||
      newLevel !== userProgress.level
    ) {
      await db.$executeRaw`
        UPDATE UserBattlePass 
        SET experience = ${newExperience}, level = ${newLevel}, totalSpent = ${newTotalSpent}, updatedAt = ${getCurrentTimeVNDB()}
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
