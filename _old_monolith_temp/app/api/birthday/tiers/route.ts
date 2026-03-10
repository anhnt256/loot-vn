import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const tiers = await db.$queryRaw<any[]>`
      SELECT 
        id,
        tierName,
        discountPercent,
        milestoneAmount,
        additionalAmount,
        bonusAmount,
        totalAtTier,
        totalReceived,
        freeSpins,
        isActive
      FROM BirthdayTier 
      WHERE isActive = 1 
      ORDER BY milestoneAmount ASC
    `;

    return NextResponse.json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    console.error("Error fetching birthday tiers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch birthday tiers" },
      { status: 500 },
    );
  }
}
