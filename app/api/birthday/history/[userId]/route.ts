import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = parseInt(params.userId);
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 },
      );
    }

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch not found" },
        { status: 400 },
      );
    }

    // Lấy lịch sử nhận thưởng birthday đã claim
    const history = await db.$queryRaw<any[]>`
      SELECT 
        up.id,
        up.userId,
        up.tierId,
        bt.tierName,
        bt.bonusAmount,
        bt.freeSpins,
        up.claimedAt
      FROM UserBirthdayProgress up
      LEFT JOIN BirthdayTier bt ON up.tierId = bt.id
      WHERE up.userId = ${userId} 
        AND up.branch = ${branch} 
        AND up.isClaimed = 1
        AND up.claimedAt IS NOT NULL
      ORDER BY up.claimedAt DESC
    `;

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching birthday history:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
