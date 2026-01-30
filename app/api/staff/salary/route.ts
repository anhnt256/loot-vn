import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getBranchFromCookie } from "@/lib/server-utils";
import dayjs from "@/lib/dayjs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

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

    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return NextResponse.json(
        { success: false, error: "staffId is required" },
        { status: 400 },
      );
    }

    // Get salary history - filter by month/year if provided, join with Staff to filter by branch
    let salaryQuery = `SELECT 
        ss.id, ss.month, ss.year, ss.totalHours, ss.hourlySalary, ss.salaryFromHours,
        ss.advance, ss.bonus, ss.penalty, ss.total, ss.status, ss.paidAt, ss.note
      FROM StaffSalary ss
      LEFT JOIN Staff s ON ss.staffId = s.id AND s.branch = ?
      WHERE ss.staffId = ? AND s.branch = ?`;

    const queryParams: any[] = [branch, parseInt(staffId), branch];

    if (month && year) {
      salaryQuery += ` AND ss.month = ? AND ss.year = ?`;
      queryParams.push(parseInt(month), parseInt(year));
    } else {
      salaryQuery += ` ORDER BY ss.year DESC, ss.month DESC LIMIT 12`;
    }

    const salaryHistory = (await db.$queryRawUnsafe(
      salaryQuery,
      ...queryParams,
    )) as any[];

    // Get bonus history - filter by month/year if provided, join with Staff to filter by branch
    let bonusHistory: any[] = [];
    try {
      let bonusQuery = `SELECT 
          b.id, b.amount, b.reason, b.description, b.imageUrl, b.note,
          b.rewardDate, b.status, b.createdAt
        FROM StaffBonus b
        LEFT JOIN Staff s ON b.staffId = s.id AND s.branch = ?
        WHERE b.staffId = ? AND s.branch = ?`;

      const bonusParams: any[] = [branch, parseInt(staffId), branch];

      if (month && year) {
        bonusQuery += ` AND YEAR(b.rewardDate) = ? AND MONTH(b.rewardDate) = ?`;
        bonusParams.push(parseInt(year), parseInt(month));
      }

      bonusQuery += ` ORDER BY b.rewardDate DESC, b.createdAt DESC LIMIT 20`;

      bonusHistory = (await db.$queryRawUnsafe(
        bonusQuery,
        ...bonusParams,
      )) as any[];
    } catch (error: any) {
      // Table doesn't exist, ignore
      if (!error.message?.includes("doesn't exist")) {
        throw error;
      }
    }

    // Get penalties history - filter by month/year if provided, join with Staff to filter by branch
    let penaltiesHistory: any[] = [];
    try {
      let penaltyQuery = `SELECT 
          p.id, p.amount, p.reason, p.description, p.imageUrl, p.note,
          p.penaltyDate, p.status, p.createdAt
        FROM StaffPenalty p
        LEFT JOIN Staff s ON p.staffId = s.id AND s.branch = ?
        WHERE p.staffId = ? AND s.branch = ?`;

      const penaltyParams: any[] = [branch, parseInt(staffId), branch];

      if (month && year) {
        penaltyQuery += ` AND YEAR(p.penaltyDate) = ? AND MONTH(p.penaltyDate) = ?`;
        penaltyParams.push(parseInt(year), parseInt(month));
      }

      penaltyQuery += ` ORDER BY p.penaltyDate DESC, p.createdAt DESC LIMIT 20`;

      penaltiesHistory = (await db.$queryRawUnsafe(
        penaltyQuery,
        ...penaltyParams,
      )) as any[];
    } catch (error: any) {
      // Table doesn't exist, ignore
      if (!error.message?.includes("doesn't exist")) {
        throw error;
      }
    }

    // Get staff baseSalary
    const staffData = (await db.$queryRawUnsafe(
      `SELECT baseSalary 
       FROM Staff 
       WHERE id = ? AND branch = ?`,
      parseInt(staffId),
      branch,
    )) as any[];

    const baseSalary = staffData.length > 0 ? (staffData[0].baseSalary || 0) : 0;

    // Calculate actual total hours from StaffTimeTracking for the selected month
    let totalHours = 0;
    if (month && year) {
      const startOfMonth = dayjs(`${year}-${month}-01`)
        .tz("Asia/Ho_Chi_Minh")
        .startOf("month")
        .format("YYYY-MM-DD");
      const endOfMonth = dayjs(`${year}-${month}-01`)
        .tz("Asia/Ho_Chi_Minh")
        .endOf("month")
        .format("YYYY-MM-DD");

      const monthRecords = (await db.$queryRawUnsafe(
        `SELECT 
          checkInTime,
          checkOutTime
        FROM StaffTimeTracking 
        WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?`,
        parseInt(staffId),
        startOfMonth,
        endOfMonth,
      )) as any[];

      const nowMonth = dayjs().tz("Asia/Ho_Chi_Minh");
      monthRecords.forEach((record: any) => {
        // Parse checkInTime
        let checkInStr = record.checkInTime;
        if (checkInStr instanceof Date) {
          checkInStr = checkInStr.toISOString();
        }
        if (typeof checkInStr !== 'string') {
          checkInStr = String(checkInStr);
        }
        const checkInDateStr = checkInStr.split('.')[0];
        const checkIn = dayjs(checkInDateStr).utcOffset(7, true);
        
        // If checkOutTime is null, set it to current time
        let checkOut = nowMonth;
        if (record.checkOutTime) {
          let checkOutStr = record.checkOutTime;
          if (checkOutStr instanceof Date) {
            checkOutStr = checkOutStr.toISOString();
          }
          if (typeof checkOutStr !== 'string') {
            checkOutStr = String(checkOutStr);
          }
          const checkOutDateStr = checkOutStr.split('.')[0];
          checkOut = dayjs(checkOutDateStr).utcOffset(7, true);
        }
        
        // Calculate diff
        const diffHours = checkOut.diff(checkIn, "hour", true);
        totalHours += Math.abs(diffHours);
      });
    }

    // Calculate salary = totalHours * baseSalary, then round up to nearest 1000
    const salary = Math.ceil((totalHours * baseSalary) / 1000) * 1000;

    // If there's a StaffSalary record for this month, use values from there
    // Otherwise, calculate from bonusHistory and penaltiesHistory
    let bonus = 0;
    let penalty = 0;
    
    if (month && year && salaryHistory.length > 0) {
      // Use values from StaffSalary record if exists
      const salaryRecord = salaryHistory[0];
      bonus = salaryRecord.bonus || 0;
      penalty = salaryRecord.penalty || 0;
    } else {
      // Calculate from history - include all statuses (PENDING, APPROVED, PAID)
      // to show total bonus/penalty for the month
      bonus = bonusHistory.reduce((sum, b) => sum + (b.amount || 0), 0);
      penalty = penaltiesHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
    }

    const netSalary = salary + bonus - penalty;

    return NextResponse.json({
      success: true,
      data: {
        salaryHistory: salaryHistory || [],
        bonusHistory: bonusHistory || [],
        penaltiesHistory: penaltiesHistory || [],
        summary: {
          totalHours,
          salary,
          bonus,
          penalty,
          netSalary,
        },
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
          summary: {
            totalHours: 0,
            salary: 0,
            bonus: 0,
            penalty: 0,
            netSalary: 0,
          },
        },
      });
    }

    console.error("Error fetching salary:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch salary" },
      { status: 500 },
    );
  }
}
