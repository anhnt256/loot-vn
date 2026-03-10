import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getBranchFromCookie } from "@/lib/server-utils";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import dayjs from "@/lib/dayjs";

// GET: Get all penalties for all staff (manager view)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // Only check staffToken for staff/manager APIs
    const token = cookieStore.get("staffToken")?.value;

    if (!token) {
      const response = NextResponse.json(
        { success: false, error: "Unauthorized - Please login again" },
        { status: 401 },
      );
      response.headers.set("X-Redirect-To", "/staff-login");
      return response;
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "staff") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Use branch from cookie first, fallback to token payload
    const branch = (await getBranchFromCookie()) || payload.branch;
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Missing branch" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const staffId = searchParams.get("staffId");

    let query = `
      SELECT 
        p.id, p.staffId, p.amount, p.reason, p.description, p.imageUrl, p.note,
        p.penaltyDate, p.status, p.createdAt, p.updatedAt,
        s.fullName, s.userName
      FROM StaffPenalty p
      LEFT JOIN Staff s ON p.staffId = s.id AND s.branch = ?
      WHERE s.branch = ?
    `;

    const params: any[] = [branch, branch];

    if (staffId) {
      query += ` AND p.staffId = ?`;
      params.push(parseInt(staffId));
    }

    if (month && year) {
      query += ` AND YEAR(p.penaltyDate) = ? AND MONTH(p.penaltyDate) = ?`;
      params.push(parseInt(year), parseInt(month));
    }

    query += ` ORDER BY p.penaltyDate DESC, p.createdAt DESC LIMIT 100`;

    try {
      const penalties = (await db.$queryRawUnsafe(query, ...params)) as any[];

      return NextResponse.json({
        success: true,
        data: penalties || [],
      });
    } catch (error: any) {
      if (error.message?.includes("doesn't exist")) {
        return NextResponse.json({
          success: true,
          data: [],
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

// POST: Create new penalty
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // Only check staffToken for staff APIs
    const token = cookieStore.get("staffToken")?.value;

    if (!token) {
      const response = NextResponse.json(
        { success: false, error: "Unauthorized - Please login again" },
        { status: 401 },
      );
      response.headers.set("X-Redirect-To", "/staff-login");
      return response;
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "staff") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Use branch from cookie first, fallback to token payload
    const branch = (await getBranchFromCookie()) || payload.branch;
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Missing branch" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      staffId,
      amount,
      reason,
      description,
      imageUrl,
      note,
      penaltyDate,
    } = body;

    if (!staffId || !amount || !reason) {
      return NextResponse.json(
        { success: false, error: "staffId, amount, and reason are required" },
        { status: 400 },
      );
    }

    // Verify staff exists and belongs to same branch
    const staff = (await db.$queryRawUnsafe(
      `SELECT id, branch FROM Staff WHERE id = ? AND branch = ? AND isDeleted = false`,
      parseInt(staffId),
      branch,
    )) as any[];

    if (staff.length === 0) {
      // Check if staff exists in other branch for better error message
      const staffInOtherBranch = (await db.$queryRawUnsafe(
        `SELECT id, branch FROM Staff WHERE id = ? AND isDeleted = false`,
        parseInt(staffId),
      )) as any[];

      if (staffInOtherBranch.length > 0) {
        console.error(
          `Staff ${staffId} exists but in branch ${staffInOtherBranch[0].branch}, not ${branch}`,
        );
        return NextResponse.json(
          {
            success: false,
            error: `Staff không thuộc branch ${branch}. Staff này thuộc branch ${staffInOtherBranch[0].branch}`,
          },
          { status: 404 },
        );
      }

      console.error(`Staff ${staffId} not found in branch ${branch}`);
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 },
      );
    }

    const nowVN = getCurrentTimeVNDB();
    const penaltyDateValue = penaltyDate
      ? dayjs(penaltyDate).utcOffset(7).format("YYYY-MM-DD HH:mm:ss")
      : nowVN;

    await db.$executeRawUnsafe(
      `INSERT INTO StaffPenalty (staffId, amount, reason, description, imageUrl, note, penaltyDate, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      parseInt(staffId),
      parseFloat(amount),
      reason,
      description || null,
      imageUrl || null,
      note || null,
      penaltyDateValue,
      nowVN,
      nowVN,
    );

    return NextResponse.json({
      success: true,
      message: "Phạt đã được thêm thành công",
    });
  } catch (error: any) {
    console.error("Error creating penalty:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create penalty" },
      { status: 500 },
    );
  }
}
