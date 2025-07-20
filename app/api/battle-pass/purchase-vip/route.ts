import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateLevel } from "@/lib/battle-pass-utils";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export async function POST(request: Request) {
  try {
    console.log("Purchase VIP - Request started");

    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get("user");
    console.log(
      "Purchase VIP - User header:",
      userHeader ? "exists" : "not found",
    );

    if (!userHeader) {
      console.log("Purchase VIP - No user header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);
    console.log("Purchase VIP - Decoded user:", decoded);

    if (!decoded || !decoded.userId) {
      console.log("Purchase VIP - Invalid user data");
      return NextResponse.json({ error: "Invalid user data" }, { status: 401 });
    }

    // Get branch from user data or default to GO_VAP
    const branch = decoded.branch || "GO_VAP";
    console.log("Purchase VIP - Branch:", branch);

    // Convert userId to number
    const userId = parseInt(decoded.userId);
    if (isNaN(userId)) {
      console.log("Purchase VIP - Invalid userId:", decoded.userId);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    console.log("Purchase VIP - UserId:", userId);

    const body = await request.json();
    console.log("Purchase VIP - Request body:", body);
    const { duration } = body;

    if (!duration || typeof duration !== "number" || duration <= 0) {
      console.log("Purchase VIP - Invalid duration:", duration);
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
      console.log("Purchase VIP - No active season found");
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

    console.log("Purchase VIP - User progress updated:", userProgress);
    console.log("Purchase VIP - Success, returning response");
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
