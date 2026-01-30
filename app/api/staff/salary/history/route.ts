import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getBranchFromCookie } from "@/lib/server-utils";
import dayjs from "@/lib/dayjs";

export async function GET(request: NextRequest) {
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

    // Use branch from token payload first, fallback to cookie
    const branch = payload.branch || await getBranchFromCookie();
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Missing branch" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!staffId || !month || !year) {
      return NextResponse.json(
        { success: false, error: "staffId, month, and year are required" },
        { status: 400 },
      );
    }

    const requestedMonth = parseInt(month);
    const requestedYear = parseInt(year);
    const now = dayjs();
    const currentMonth = now.month() + 1; // 1-12
    const currentYear = now.year();

    // Validate: Only allow current month or previous month (max 1 month back)
    // Example: If current month is January, can view December (previous year) and January (current)
    let isValid = false;

    // Check if requested month is current month
    if (requestedYear === currentYear && requestedMonth === currentMonth) {
      isValid = true;
    }
    // Check if requested month is previous month
    else if (currentMonth === 1) {
      // If current month is January, previous month is December of previous year
      if (requestedYear === currentYear - 1 && requestedMonth === 12) {
        isValid = true;
      }
    } else {
      // Previous month in same year
      if (
        requestedYear === currentYear &&
        requestedMonth === currentMonth - 1
      ) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Chỉ được xem lịch sử của tháng hiện tại hoặc tháng trước",
        },
        { status: 403 },
      );
    }

    try {
      // Get salary history for the month
      const salaryHistory = (await db.$queryRawUnsafe(
        `SELECT 
          ss.id, ss.month, ss.year, ss.totalHours, ss.hourlySalary, ss.salaryFromHours,
          ss.advance, ss.bonus, ss.penalty, ss.total, ss.status, ss.paidAt, ss.note
        FROM StaffSalary ss
        LEFT JOIN Staff s ON ss.staffId = s.id AND s.branch = ?
        WHERE ss.staffId = ? AND ss.month = ? AND ss.year = ? AND s.branch = ?
        ORDER BY ss.createdAt DESC`,
        branch,
        parseInt(staffId),
        requestedMonth,
        requestedYear,
        branch,
      )) as any[];

      // Get bonus history for the month - join with Staff to filter by branch
      let bonusHistory: any[] = [];
      try {
        bonusHistory = (await db.$queryRawUnsafe(
          `SELECT 
            b.id, b.amount, b.reason, b.description, b.imageUrl, b.note,
            b.rewardDate, b.status, b.createdAt
          FROM StaffBonus b
          LEFT JOIN Staff s ON b.staffId = s.id AND s.branch = ?
          WHERE b.staffId = ? 
            AND YEAR(b.rewardDate) = ? 
            AND MONTH(b.rewardDate) = ?
            AND s.branch = ?
          ORDER BY b.rewardDate DESC, b.createdAt DESC`,
          branch,
          parseInt(staffId),
          requestedYear,
          requestedMonth,
          branch,
        )) as any[];
      } catch (error: any) {
        if (!error.message?.includes("doesn't exist")) {
          throw error;
        }
      }

      // Get penalties history for the month - join with Staff to filter by branch
      let penaltiesHistory: any[] = [];
      try {
        penaltiesHistory = (await db.$queryRawUnsafe(
          `SELECT 
            p.id, p.amount, p.reason, p.description, p.imageUrl, p.note,
            p.penaltyDate, p.status, p.createdAt
          FROM StaffPenalty p
          LEFT JOIN Staff s ON p.staffId = s.id AND s.branch = ?
          WHERE p.staffId = ? 
            AND YEAR(p.penaltyDate) = ? 
            AND MONTH(p.penaltyDate) = ?
            AND s.branch = ?
          ORDER BY p.penaltyDate DESC, p.createdAt DESC`,
          branch,
          parseInt(staffId),
          requestedYear,
          requestedMonth,
          branch,
        )) as any[];
      } catch (error: any) {
        if (!error.message?.includes("doesn't exist")) {
          throw error;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          salaryHistory: salaryHistory || [],
          bonusHistory: bonusHistory || [],
          penaltiesHistory: penaltiesHistory || [],
        },
      });
    } catch (error: any) {
      // If tables don't exist, return empty data
      if (error.message?.includes("doesn't exist")) {
        return NextResponse.json({
          success: true,
          data: {
            salaryHistory: [],
            bonusHistory: [],
            penaltiesHistory: [],
          },
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error fetching salary history:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch salary history",
      },
      { status: 500 },
    );
  }
}
