import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";

export async function GET(request: NextRequest) {
  try {
    const branch = await getBranchFromCookie();

    const staffList = await db.staff.findMany({
      where: {
        branch: branch,
        isDeleted: false,
        isAdmin: false,
      },
      select: {
        id: true,
        fullName: true,
        userName: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: staffList,
    });
  } catch (error) {
    console.error("Error fetching staff list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff list" },
      { status: 500 },
    );
  }
}
