import { NextRequest, NextResponse } from "next/server";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";
import { db } from "@/lib/db";
import dayjs from "@/lib/dayjs";

export async function GET() {
  try {
    const currentVNTime = getCurrentTimeVNISO();
    const currentVNTimeFormatted = dayjs()
      .utcOffset(7)
      .format("YYYY-MM-DD HH:mm:ss");
    const testName = `Test Rank ${new Date().getTime()}`;

    // Test insert vào table Rank bằng raw SQL
    const result = await db.$executeRaw`
      INSERT INTO Rank (name, fromValue, toValue, discount, foodVoucher, drinkVoucher, createdAt, updatedAt)
      VALUES (${testName}, 100.0, 200.0, 10.0, 5, 3, ${currentVNTimeFormatted}, ${currentVNTimeFormatted})
    `;

    // Lấy record vừa insert để trả về
    const insertedRank = await db.$queryRaw`
      SELECT * FROM Rank WHERE name = ${testName} ORDER BY createdAt DESC LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      message: "Test timezone API with Rank insert using raw SQL",
      data: {
        currentVNTime,
        currentVNTimeFormatted,
        insertedRank: Array.isArray(insertedRank)
          ? insertedRank[0]
          : insertedRank,
        rawResult: result,
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
      { status: 500 },
    );
  }
}
