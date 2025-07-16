import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    // Get request body
    const body = await request.json();
    const { experience, totalSpent } = body;

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

    // Find or create user progress
    let userProgress = await db.userBattlePass.findFirst({
      where: {
        userId: parseInt(decoded.userId),
        seasonId: currentSeason.id,
      },
    });

    if (!userProgress) {
      // Create new user progress
      userProgress = await db.userBattlePass.create({
        data: {
          userId: parseInt(decoded.userId),
          seasonId: currentSeason.id,
          level: 0,
          experience: experience || 0,
          isPremium: false,
          totalSpent: totalSpent || 0,
          branch: "GO_VAP",
        },
      });
    } else {
      // Update existing progress
      userProgress = await db.userBattlePass.update({
        where: {
          id: userProgress.id,
        },
        data: {
          experience:
            experience !== undefined ? experience : userProgress.experience,
          totalSpent:
            totalSpent !== undefined ? totalSpent : userProgress.totalSpent,
        },
      });
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
