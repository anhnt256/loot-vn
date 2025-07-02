import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";

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
    const deletedUsers = await db.user.deleteMany({
      where: {
        userName: user.userName.toString(),
        branch: branchFromCookie,
      },
    });

    // Tạo lại user mới với tham số từ user
    const newUser = await db.user.create({
      data: {
        userId: user.userId,
        userName: user.userName || user.userId.toString(),
        stars: user.stars || 0,
        branch: branchFromCookie,
        rankId: user.rankId || 1, // Default rankId
        magicStone: user.magicStone || 0,
        totalPayment: user.totalPayment || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedUsers.count,
      newUser: {
        id: newUser.id,
        userId: newUser.userId,
        userName: newUser.userName,
        stars: newUser.stars,
        branch: newUser.branch,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (e: any) {
    console.error("Reset error:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
} 