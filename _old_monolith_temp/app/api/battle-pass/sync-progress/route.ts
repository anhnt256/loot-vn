import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { cookies } from "next/headers";
import { getOrCreateUserBattlePass } from "@/lib/battle-pass-creation";

export async function POST(request: Request) {
  try {
    // console.log("=== SYNC PROGRESS API START ===");

    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get("user");
    // console.log("User header:", userHeader);

    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);
    // console.log("Decoded user:", decoded);

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

    // Convert userId to number for Prisma
    const userId = parseInt(decoded.userId.toString(), 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Get current active season
    // console.log("Getting current season...");
    const currentSeasons = await db.$queryRaw<any[]>`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true
        AND startDate <= DATE(${getCurrentTimeVNDB()})
        AND endDate >= DATE(${getCurrentTimeVNDB()})
      LIMIT 1
    `;

    const currentSeason = currentSeasons[0];

    // console.log("Current season:", currentSeason);

    if (!currentSeason) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 },
      );
    }

    // Find or create user progress với Redis lock
    const userProgress = await getOrCreateUserBattlePass({
      userId: decoded.userId,
      seasonId: currentSeason.id,
      branch,
      maxLevel: 100, // Default max level, sẽ được override nếu season có maxLevel
      initialExperience: 0,
      initialLevel: 0,
    });

    if (!userProgress) {
      return NextResponse.json(
        { error: "Failed to create or retrieve user progress" },
        { status: 500 },
      );
    }

    const response = {
      success: true,
      experience: userProgress.experience,
      level: userProgress.level,
      totalSpent: userProgress.totalSpent,
    };

    // console.log("Response:", response);
    // console.log("=== SYNC PROGRESS API END ===");

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
