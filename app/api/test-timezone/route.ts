import { NextRequest, NextResponse } from "next/server";
import { getVNTimeForPrisma } from "@/lib/timezone-utils";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "Test timezone API",
      data: {
        currentVNTime: getVNTimeForPrisma(),
      },
    });
  } catch (error) {
    console.error("Error in test timezone GET API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get timezone",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 