import { NextResponse } from "next/server";
import { db, getFnetDB } from "@/lib/db";
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

    const fnetDB = await getFnetDB();
    const userId = parseInt(decoded.userId);

    // Get current active season
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

    // Get user's spending from fnet database
    const result = await fnetDB.$queryRaw<any[]>`
      SELECT SUM(Amount) as totalSpending
      FROM fnet.ordertb
      WHERE UserId = ${userId}
        AND DATE(OrderDate) = CURDATE()
        AND Status = 1
    `;
    const totalSpending = result[0]?.totalSpending || 0;

    // Calculate food and drink spending (50/50 split for demo)
    const foodSpending = Math.floor(totalSpending * 0.5);
    const drinkSpending = Math.floor(totalSpending * 0.5);

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
        SET totalSpent = ${totalSpending}, updatedAt = ${getCurrentTimeVNISO()}
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
        VALUES (${decoded.userId}, ${currentSeason.id}, ${calculateLevel(0, currentSeason.maxLevel)}, 0, false, ${totalSpending}, 'GO_VAP', ${getCurrentTimeVNISO()}, ${getCurrentTimeVNISO()})
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
      foodSpending,
      drinkSpending,
      totalSpent: userProgress.totalSpent,
    });
  } catch (error) {
    console.error("Error updating battle pass spending:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
