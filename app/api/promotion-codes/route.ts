import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

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

    // Build where conditions với event branch filter
    const whereConditions: any = {
      OR: [
        { branch: branch },
        {
          event: {
            branch: "ALL",
          },
        },
      ],
    };

    if (eventId) {
      whereConditions.eventId = eventId;
    }

    if (isUsed !== null) {
      whereConditions.isUsed = isUsed === "true";
    }

    // Build dynamic SQL
    let sqlQuery = `
      SELECT 
        pc.*,
        e.name as eventName,
        e.branch as eventBranch
      FROM PromotionCode pc
      LEFT JOIN Event e ON pc.eventId = e.id
      WHERE (pc.branch = '${branch}' OR e.branch = 'ALL')
    `;
    
    if (eventId) {
      sqlQuery += ` AND pc.eventId = '${eventId}'`;
    }
    
    if (isUsed !== null) {
      sqlQuery += ` AND pc.isUsed = ${isUsed === "true" ? 1 : 0}`;
    }
    
    sqlQuery += `
      ORDER BY pc.createdAt DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const codes = await db.$queryRawUnsafe<any[]>(sqlQuery);

    // Get total count
    const totalCount = await db.promotionCode.count({
      where: whereConditions,
    });

    // Get used count
    const usedCountResult = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM PromotionCode pc
      LEFT JOIN Event e ON pc.eventId = e.id
      WHERE (pc.branch = ${branch} OR e.branch = 'ALL')
        AND pc.isUsed = true
    `;
    const usedCount = Number(usedCountResult[0].count);

    return NextResponse.json({
      success: true,
      codes,
      totalCount: totalCount,
      usedCount: usedCount,
      pagination: {
        limit,
        offset,
        hasMore: codes.length === limit,
      },
    });
  } catch (error) {
    console.error("[PROMOTION_CODES_GET]", error);
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
      name,
      code,
      value,
      eventId,
      rewardType,
      rewardValue,
      expirationDate,
    } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: "name and code are required" },
        { status: 400 },
      );
    }

    // Check if code already exists
    const existingCode = await db.promotionCode.findFirst({
      where: {
        code: code,
        branch: branch,
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "Promotion code already exists" },
        { status: 400 },
      );
    }

    // Create promotion code
    const result = await db.promotionCode.create({
      data: {
        name,
        code,
        value: value || null,
        branch,
        isUsed: false,
        eventId: eventId || null,
        rewardType: rewardType || null,
        rewardValue: rewardValue || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Promotion code created successfully",
    });
  } catch (error) {
    console.error("[PROMOTION_CODES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
