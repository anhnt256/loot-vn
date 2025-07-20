import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branchFromCookie = cookieStore.get("branch")?.value;

    if (!branchFromCookie) {
      return NextResponse.json(
        { success: false, message: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const { user } = await req.json();
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid user data" },
        { status: 400 },
      );
    }

    // Xóa toàn bộ tài khoản có userName = user.userName
    const deletedResult = await db.$executeRaw`
      DELETE FROM User 
      WHERE userName = ${user.userName.toString()} 
      AND branch = ${branchFromCookie}
    `;

    // Tạo lại user mới với tham số từ user
    await db.$executeRaw`
      INSERT INTO User (userId, userName, stars, branch, rankId, magicStone, totalPayment, createdAt, updatedAt)
      VALUES (
        ${user.userId},
        ${user.userName || user.userId.toString()},
        ${user.stars || 0},
        ${branchFromCookie},
        ${user.rankId || 1},
        ${user.magicStone || 0},
        ${user.totalPayment || 0},
        NOW(),
        NOW()
      )
    `;

    // Get the created user
    const newUser = await db.$queryRaw<any[]>`
      SELECT id, userId, userName, stars, branch, createdAt, updatedAt FROM User 
      WHERE userId = ${user.userId} 
      AND branch = ${branchFromCookie}
      ORDER BY id DESC
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      deletedCount: deletedResult,
      newUser: newUser[0],
    });
  } catch (e: any) {
    console.error("Reset error:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
}
