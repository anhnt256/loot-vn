import { NextRequest, NextResponse } from "next/server";
import { getVNTimeForPrisma } from "@/lib/timezone-utils";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const currentVNTime = getVNTimeForPrisma();
    
    // Test insert vào table Rank
    const testRank = await db.rank.create({
      data: {
        name: `Test Rank ${new Date().getTime()}`,
        fromValue: 100.0,
        toValue: 200.0,
        discount: 10.0,
        foodVoucher: 5,
        drinkVoucher: 3,
        createdAt: currentVNTime,
        updatedAt: currentVNTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test timezone API with Rank insert",
      data: {
        currentVNTime,
        insertedRank: testRank,
      },
    });
  } catch (error) {
    console.error("Error in test timezone GET API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get timezone or insert rank",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 