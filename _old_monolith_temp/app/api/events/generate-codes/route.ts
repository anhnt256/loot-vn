import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { eventId, codePrefix, expirationDays } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 },
      );
    }

    // Validate event exists and belongs to branch
    const event = await db.$queryRaw<any[]>`
      SELECT * FROM Event 
      WHERE id = ${eventId} 
        AND branch = ${branch}
        AND isActive = true
    `;

    if (event.length === 0) {
      return NextResponse.json(
        { error: "Event not found or not accessible" },
        { status: 404 },
      );
    }

    // Get all active rewards for this event
    const rewards = await db.$queryRaw<any[]>`
      SELECT * FROM EventReward 
      WHERE eventId = ${eventId} 
        AND isActive = true
      ORDER BY priority ASC
    `;

    if (rewards.length === 0) {
      return NextResponse.json(
        { error: "No active rewards found for this event" },
        { status: 400 },
      );
    }

    const generatedCodes = [];
    const prefix = codePrefix || eventId.toUpperCase().substring(0, 8);

    // Generate codes for each reward
    for (const reward of rewards) {
      const rewardConfig = JSON.parse(reward.rewardConfig);
      const quantity = reward.maxQuantity || 100; // Default quantity

      for (let i = 0; i < quantity; i++) {
        const codeNumber = String(i + 1).padStart(4, "0");
        const code = `${prefix}_${reward.rewardType}_${codeNumber}`;

        // Calculate expiration date
        const expirationDate = expirationDays
          ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
          : new Date(event[0].endDate);

        // Create promotion code
        await db.$executeRaw`
          INSERT INTO PromotionCode (
            name, code, value, branch, isUsed, eventId, 
            rewardType, rewardValue, expirationDate, 
            createdAt, updatedAt
          )
          VALUES (
            ${`${event[0].name} - ${reward.name} ${i + 1}`},
            ${code},
            ${rewardConfig.value || rewardConfig.discountAmount || null},
            ${branch},
            false,
            ${eventId},
            ${reward.rewardType},
            ${rewardConfig.value || rewardConfig.discountAmount || null},
            ${expirationDate},
            ${getCurrentTimeVNDB()},
            ${getCurrentTimeVNDB()}
          )
        `;

        generatedCodes.push({
          code,
          rewardType: reward.rewardType,
          rewardValue: rewardConfig.value || rewardConfig.discountAmount,
          expirationDate,
        });
      }
    }

    // Update event tracking
    await db.$executeRaw`
      UPDATE Event 
      SET totalCodesGenerated = totalCodesGenerated + ${generatedCodes.length},
          updatedAt = ${getCurrentTimeVNDB()}
      WHERE id = ${eventId}
    `;

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedCodes.length} promotion codes`,
      codes: generatedCodes,
      event: event[0],
    });
  } catch (error) {
    console.error("[EVENT_GENERATE_CODES]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const isUsed = searchParams.get("isUsed");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 },
      );
    }

    // Validate event exists and belongs to branch
    const event = await db.$queryRaw<any[]>`
      SELECT * FROM Event 
      WHERE id = ${eventId} 
        AND branch = ${branch}
        AND isActive = true
    `;

    if (event.length === 0) {
      return NextResponse.json(
        { error: "Event not found or not accessible" },
        { status: 404 },
      );
    }

    let whereClause = `WHERE eventId = '${eventId}' AND branch = '${branch}'`;

    if (isUsed !== null) {
      whereClause += ` AND isUsed = ${isUsed === "true"}`;
    }

    const codes = await db.$queryRaw<any[]>`
      SELECT * FROM PromotionCode 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalCount = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM PromotionCode 
      ${whereClause}
    `;

    const usedCount = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM PromotionCode 
      WHERE eventId = '${eventId}' AND branch = '${branch}' AND isUsed = true
    `;

    return NextResponse.json({
      success: true,
      codes,
      totalCount: totalCount[0].count,
      usedCount: usedCount[0].count,
      unusedCount: totalCount[0].count - usedCount[0].count,
      pagination: {
        limit,
        offset,
        hasMore: codes.length === limit,
      },
    });
  } catch (error) {
    console.error("[EVENT_CODES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
