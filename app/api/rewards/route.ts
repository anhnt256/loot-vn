import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build dynamic query với join Event để filter theo branch
    let query = `
      SELECT 
        er.id,
        er.name,
        er.description,
        er.rewardType as type,
        er.rewardConfig,
        er.maxQuantity as maxUsageCount,
        er.used as usageCount,
        er.isActive,
        er.createdAt,
        er.updatedAt,
        er.validFrom as startDate,
        er.validTo as endDate,
        e.branch
      FROM EventReward er
      INNER JOIN Event e ON er.eventId = e.id
      WHERE er.isActive = true AND (e.branch = '${branch}' OR e.branch = 'ALL')
    `;

    // Add eventId filter if provided
    if (eventId) {
      query += ` AND er.eventId = '${eventId}'`;
    }

    query += `
      ORDER BY er.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const rewards: any = await db.$queryRawUnsafe<any[]>(query);

    // Count query
    let countQuery = `
      SELECT COUNT(*) as count 
      FROM EventReward er
      INNER JOIN Event e ON er.eventId = e.id
      WHERE er.isActive = true AND (e.branch = '${branch}' OR e.branch = 'ALL')
    `;

    // Add eventId filter if provided
    if (eventId) {
      countQuery += ` AND er.eventId = '${eventId}'`;
    }

    const totalCount = await db.$queryRawUnsafe<any[]>(countQuery);

    // Transform data để match với cấu trúc frontend và convert BigInt
    const transformedRewards = rewards.map((reward: any) => {
      // Parse rewardConfig để lấy value
      let value = 0;
      let minOrderAmount = null;
      let maxDiscountAmount = null;
      let itemType = null;

      try {
        const config = JSON.parse(reward.rewardConfig);
        console.log(`[DEBUG] Reward ${reward.id} config:`, config);
        value =
          config.value || config.discountAmount || config.freeQuantity || 0;
        minOrderAmount = config.minOrderAmount || null;
        maxDiscountAmount = config.maxDiscountAmount || null;
        itemType = config.itemType || null;
        console.log(`[DEBUG] Reward ${reward.id} parsed itemType:`, itemType);
      } catch (e) {
        console.error("Error parsing rewardConfig:", e);
      }

      return {
        id: Number(reward.id),
        name: reward.name,
        description: reward.description || "",
        type: reward.type,
        value: value,
        minOrderAmount: minOrderAmount,
        maxDiscountAmount: maxDiscountAmount,
        isActive: Boolean(reward.isActive),
        usageCount: Number(reward.usageCount),
        maxUsageCount: reward.maxUsageCount
          ? Number(reward.maxUsageCount)
          : null,
        createdAt: reward.createdAt,
        startDate: reward.startDate,
        endDate: reward.endDate,
        itemType: itemType,
      };
    });

    return NextResponse.json({
      success: true,
      rewards: transformedRewards,
      totalCount: Number(totalCount[0].count),
      pagination: {
        limit,
        offset,
        hasMore: rewards.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching promotion rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      maxUsageCount,
      itemType,
      isActive,
    } = body;

    // Validate required fields
    if (!name || !type || value === undefined) {
      return NextResponse.json(
        { error: "Name, type, and value are required" },
        { status: 400 },
      );
    }

    // Nếu không có eventId, lấy event mặc định của branch (hoặc báo lỗi)
    const targetEventId = eventId;
    if (!targetEventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    // Build rewardConfig based on type
    const rewardConfig: any = {
      value: value,
    };

    if (minOrderAmount !== undefined && minOrderAmount !== null) {
      rewardConfig.minOrderAmount = minOrderAmount;
    }

    if (maxDiscountAmount !== undefined && maxDiscountAmount !== null) {
      rewardConfig.maxDiscountAmount = maxDiscountAmount;
    }

    if (itemType) {
      rewardConfig.itemType = itemType;
    }

    const now = getCurrentTimeVNDB();

    // Insert reward
    await db.$executeRaw`
      INSERT INTO EventReward (
        eventId, name, description, rewardType, rewardConfig,
        maxQuantity, used, isActive, createdAt, updatedAt
      )
      VALUES (
        ${targetEventId},
        ${name},
        ${description || null},
        ${type},
        ${JSON.stringify(rewardConfig)},
        ${maxUsageCount || null},
        0,
        ${isActive !== undefined ? isActive : true},
        ${now},
        ${now}
      )
    `;

    // Get the created reward
    const createdReward = await db.$queryRaw<any[]>`
      SELECT * FROM EventReward 
      WHERE name = ${name} 
        AND eventId = ${targetEventId}
      ORDER BY createdAt DESC
      LIMIT 1
    `;

    if (createdReward.length === 0) {
      return NextResponse.json(
        { error: "Failed to create reward" },
        { status: 500 },
      );
    }

    const reward = createdReward[0];

    return NextResponse.json({
      success: true,
      reward: {
        id: Number(reward.id),
        name: reward.name,
        description: reward.description || "",
        type: reward.rewardType,
        value: value,
        minOrderAmount: minOrderAmount || null,
        maxDiscountAmount: maxDiscountAmount || null,
        itemType: itemType || null,
        isActive: Boolean(reward.isActive),
        usageCount: Number(reward.used),
        maxUsageCount: maxUsageCount || null,
        createdAt: reward.createdAt.toISOString(),
        updatedAt: reward.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[REWARD_CREATE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
