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
    const {
      eventId,
      name,
      description,
      rewardType,
      rewardConfig,
      conditions,
      eligibility,
      maxQuantity,
      maxPerUser,
      maxPerDay,
      validFrom,
      validTo,
      priority = 1,
    } = body;

    // Validate required fields
    if (!eventId || !name || !rewardType || !rewardConfig) {
      return NextResponse.json(
        { error: "eventId, name, rewardType, and rewardConfig are required" },
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

    // Validate rewardConfig is valid JSON
    let parsedRewardConfig;
    try {
      parsedRewardConfig =
        typeof rewardConfig === "string"
          ? JSON.parse(rewardConfig)
          : rewardConfig;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid rewardConfig JSON format" },
        { status: 400 },
      );
    }

    // Create event reward
    const reward = await db.$executeRaw`
      INSERT INTO EventReward (
        eventId, name, description, rewardType, rewardConfig,
        conditions, eligibility, maxQuantity, maxPerUser, maxPerDay,
        validFrom, validTo, priority, isActive, createdAt, updatedAt
      )
      VALUES (
        ${eventId},
        ${name},
        ${description || null},
        ${rewardType},
        ${JSON.stringify(parsedRewardConfig)},
        ${conditions ? JSON.stringify(conditions) : null},
        ${eligibility ? JSON.stringify(eligibility) : null},
        ${maxQuantity || null},
        ${maxPerUser || null},
        ${maxPerDay || null},
        ${validFrom ? new Date(validFrom) : null},
        ${validTo ? new Date(validTo) : null},
        ${priority},
        true,
        ${getCurrentTimeVNDB()},
        ${getCurrentTimeVNDB()}
      )
    `;

    // Get the created reward
    const createdReward = await db.$queryRaw<any[]>`
      SELECT * FROM EventReward 
      WHERE eventId = ${eventId} 
        AND name = ${name}
        AND createdAt >= ${getCurrentTimeVNDB()}
      ORDER BY createdAt DESC
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      reward: createdReward[0],
    });
  } catch (error) {
    console.error("[EVENT_REWARD_CREATE]", error);
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
    const rewardType = searchParams.get("rewardType");
    const limit = parseInt(searchParams.get("limit") || "20");
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

    let whereClause = `WHERE eventId = '${eventId}' AND isActive = true`;

    if (rewardType) {
      whereClause += ` AND rewardType = '${rewardType}'`;
    }

    const rewards = await db.$queryRaw<any[]>`
      SELECT * FROM EventReward 
      ${whereClause}
      ORDER BY priority ASC, createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalCount = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM EventReward 
      ${whereClause}
    `;

    return NextResponse.json({
      success: true,
      rewards,
      totalCount: totalCount[0].count,
      pagination: {
        limit,
        offset,
        hasMore: rewards.length === limit,
      },
    });
  } catch (error) {
    console.error("[EVENT_REWARD_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
