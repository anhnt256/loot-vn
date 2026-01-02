import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "staff") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!staffId) {
      return NextResponse.json(
        { success: false, error: "staffId is required" },
        { status: 400 },
      );
    }

    try {
      const penalties = (await db.$queryRawUnsafe(
        `SELECT 
          id, amount, reason, description, imageUrl, note,
          penaltyDate, status, createdAt, updatedAt
        FROM StaffPenalty 
        WHERE staffId = ?
        ORDER BY penaltyDate DESC, createdAt DESC
        LIMIT ? OFFSET ?`,
        parseInt(staffId),
        limit,
        offset,
      )) as any[];

      const totalCount = (await db.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM StaffPenalty WHERE staffId = ?`,
        parseInt(staffId),
      )) as any[];

      return NextResponse.json({
        success: true,
        data: {
          penalties: penalties || [],
          totalCount: totalCount[0]?.count || 0,
        },
      });
    } catch (error: any) {
      // Table doesn't exist yet
      if (error.message?.includes("doesn't exist")) {
        return NextResponse.json({
          success: true,
          data: {
            penalties: [],
            totalCount: 0,
          },
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error fetching penalties:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch penalties" },
      { status: 500 },
    );
  }
}
