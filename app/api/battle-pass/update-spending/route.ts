import { NextResponse } from "next/server";
import { db, getFnetDB } from "@/lib/db";
import { calculateLevel } from "@/lib/battle-pass-utils";
import { getCurrentDateVN } from "@/lib/timezone-utils";

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

    // Update or create user progress
    const userProgress = await db.userBattlePass.upsert({
      where: {
        userId_seasonId: {
          userId: parseInt(decoded.userId),
          seasonId: currentSeason.id,
        },
      },
      update: {
        totalSpent: totalSpending,
      },
      create: {
        userId: parseInt(decoded.userId),
        seasonId: currentSeason.id,
        level: calculateLevel(0, currentSeason.maxLevel), // Level 1 cho user mới (0 experience)
        experience: 0,
        isPremium: false,
        totalSpent: totalSpending,
        branch: "GO_VAP",
      },
    });

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
