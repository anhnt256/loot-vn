import { NextResponse } from "next/server";
import { getAvailableTiers } from "@/lib/tier-utils";

export async function GET() {
  try {
    const tiers = await getAvailableTiers();
    
    return NextResponse.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    console.error("Error fetching tiers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
