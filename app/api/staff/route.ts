import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/utils";

// GET - Lấy danh sách nhân viên
export async function GET(request: NextRequest) {
  try {
    const branch = getBranchFromCookie(request);
    
    const query = `
      SELECT 
        id,
        userName,
        isAdmin,
        createdAt
      FROM Staff 
      WHERE branch = ? AND isDeleted = false
      ORDER BY userName ASC
    `;

    const staff = await db.$queryRawUnsafe(query, branch);

    return NextResponse.json({
      success: true,
      data: staff
    });

  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
} 