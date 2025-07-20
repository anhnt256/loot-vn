import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateLevel } from "@/lib/battle-pass-utils";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

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

    const body = await request.json();
    const { duration } = body;

    if (!duration || typeof duration !== "number" || duration <= 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
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

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    // Check if user progress exists
    const existingProgress = await db.$queryRaw<any[]>`
      SELECT * FROM UserBattlePass 
      WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
      LIMIT 1
    `;

    let userProgress;
    if (existingProgress.length > 0) {
      // Update existing progress
      await db.$executeRaw`
        UPDATE UserBattlePass 
        SET isPremium = true, updatedAt = ${getCurrentTimeVNISO()}
        WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
      `;

      const updatedProgress = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
        LIMIT 1
      `;
      userProgress = updatedProgress[0];
    } else {
      // Create new progress
      await db.$executeRaw`
        INSERT INTO UserBattlePass (userId, seasonId, level, experience, isPremium, totalSpent, branch, createdAt, updatedAt)
        VALUES (${decoded.userId}, ${currentSeason.id}, ${calculateLevel(0, currentSeason.maxLevel)}, 0, true, 0, 'GO_VAP', ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()})
      `;

      const newProgress = await db.$queryRaw<any[]>`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${decoded.userId} AND seasonId = ${currentSeason.id}
        LIMIT 1
      `;
      userProgress = newProgress[0];
    }

    return NextResponse.json({
      success: true,
      expiryDate,
    });
  } catch (error) {
    console.error("Error purchasing VIP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
