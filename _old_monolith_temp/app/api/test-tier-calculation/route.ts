import { NextRequest, NextResponse } from "next/server";
import {
  calculateTier,
  getTierDowngradeOptions,
} from "@/lib/game-appointment-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { members, hours, revenue } = body;

    if (!members || !hours || !revenue) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: members, hours, revenue",
        },
        { status: 400 },
      );
    }

    // Calculate tier
    const tier = await calculateTier({ members, hours });

    // Get downgrade options
    const downgradeOptions = await getTierDowngradeOptions({
      members,
      hours,
      // revenue,
    });

    return NextResponse.json({
      success: true,
      data: {
        input: { members, hours, revenue },
        calculatedTier: tier,
        downgradeOptions,
        canAutoActivate: tier !== null,
      },
    });
  } catch (error) {
    console.error("Error in tier calculation:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
