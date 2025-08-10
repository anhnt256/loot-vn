import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";

export async function GET(request: NextRequest) {
  try {
    const branch = await getBranchFromCookie();
    const { searchParams } = new URL(request.url);
    const staffType = searchParams.get('type'); // counter, kitchen, security

    let query = `
      SELECT 
        id, fullName, userName, staffType, phone, email,
        isDeleted, isAdmin, branch
      FROM Staff 
      WHERE branch = ${branch} AND isDeleted = false
    `;

    // Filter by staff type if specified
    if (staffType) {
      query += ` AND staffType = '${staffType.toUpperCase()}'`;
    }

    query += ` ORDER BY fullName ASC`;

    const staff = (await db.$queryRawUnsafe(query)) as any[];

    return NextResponse.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff" },
      { status: 500 },
    );
  }
}
