import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const rewardId = parseInt(params.id);
    if (isNaN(rewardId)) {
      return NextResponse.json({ error: "Invalid reward ID" }, { status: 400 });
    }

    const body = await request.json();
    console.log(`[DEBUG] Request body:`, body);
    const {
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      maxUsageCount,
      startDate,
      endDate,
      isActive,
      itemType,
    } = body;

    // Validate required fields
    if (!name || !type || value === undefined) {
      return NextResponse.json(
        { error: "Name, type, and value are required" },
        { status: 400 },
      );
    }

    // Map frontend type to database enum
    const typeMapping: { [key: string]: string } = {
      FREE_TIME: "FREE_ITEM",
      DISCOUNT_PERCENTAGE: "PERCENTAGE_DISCOUNT",
      DISCOUNT_FIXED: "FIXED_DISCOUNT",
      FREE_ITEM: "FREE_ITEM",
      BONUS_ITEM: "BONUS_ITEM",
      CASH_BACK: "CASH_BACK",
      MULTIPLIER: "MULTIPLIER",
      CONDITIONAL_REWARD: "CONDITIONAL_REWARD",
      MAIN_ACCOUNT_TOPUP: "MAIN_ACCOUNT_TOPUP",
      TOPUP_BONUS_PERCENTAGE: "TOPUP_BONUS_PERCENTAGE",
      PERCENTAGE_DISCOUNT: "PERCENTAGE_DISCOUNT",
      FIXED_DISCOUNT: "FIXED_DISCOUNT",
      BOGO: "BONUS_ITEM",
    };

    const dbRewardType = typeMapping[type] || type;
    console.log(`[DEBUG] Type mapping: ${type} -> ${dbRewardType}`);

    // Check if reward exists and belongs to branch
    const checkQuery = `
      SELECT er.id 
      FROM EventReward er
      INNER JOIN Event e ON er.eventId = e.id
      WHERE er.id = ${rewardId} AND (e.branch = '${branch}' OR e.branch = 'ALL')
    `;

    const reward = await db.$queryRawUnsafe<any[]>(checkQuery);

    if (reward.length === 0) {
      return NextResponse.json(
        { error: "Reward not found or not accessible" },
        { status: 404 },
      );
    }

    // Build rewardConfig based on type
    let rewardConfig = {};
    if (type === "DISCOUNT_PERCENTAGE" || type === "DISCOUNT_FIXED") {
      rewardConfig = {
        value: value,
        minOrderAmount: minOrderAmount,
        maxDiscountAmount: maxDiscountAmount,
      };
    } else if (dbRewardType === "FREE_ITEM") {
      rewardConfig = {
        type: dbRewardType,
        itemType: itemType,
        freeQuantity: value,
        freeValue: value,
        minOrderAmount: minOrderAmount,
        maxDiscountAmount: maxDiscountAmount,
      };
    } else {
      rewardConfig = {
        value: value,
        minOrderAmount: minOrderAmount,
        maxDiscountAmount: maxDiscountAmount,
      };
    }

    console.log(
      `[DEBUG] Building rewardConfig for type ${type}:`,
      rewardConfig,
    );
    console.log(`[DEBUG] itemType value:`, itemType, typeof itemType);

    // Update reward
    await db.$executeRaw`
      UPDATE EventReward 
      SET 
        name = ${name},
        description = ${description || ""},
        rewardType = ${dbRewardType},
        rewardConfig = ${JSON.stringify(rewardConfig)},
        maxQuantity = ${maxUsageCount || null},
        validFrom = ${startDate || null},
        validTo = ${endDate || null},
        isActive = ${isActive !== undefined ? isActive : true},
        updatedAt = NOW()
      WHERE id = ${rewardId}
    `;

    return NextResponse.json({
      success: true,
      message: "Reward updated successfully",
    });
  } catch (error) {
    console.error("[REWARD_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const rewardId = parseInt(params.id);
    if (isNaN(rewardId)) {
      return NextResponse.json({ error: "Invalid reward ID" }, { status: 400 });
    }

    // Check if reward exists and belongs to branch
    const checkQuery = `
      SELECT er.id 
      FROM EventReward er
      INNER JOIN Event e ON er.eventId = e.id
      WHERE er.id = ${rewardId} AND (e.branch = '${branch}' OR e.branch = 'ALL')
    `;

    const reward = await db.$queryRawUnsafe<any[]>(checkQuery);

    if (reward.length === 0) {
      return NextResponse.json(
        { error: "Reward not found or not accessible" },
        { status: 404 },
      );
    }

    // Soft delete by setting isActive to false
    await db.$executeRaw`
      UPDATE EventReward 
      SET isActive = false, updatedAt = NOW()
      WHERE id = ${rewardId}
    `;

    return NextResponse.json({
      success: true,
      message: "Reward deleted successfully",
    });
  } catch (error) {
    console.error("[REWARD_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
