import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dayjs from "@/lib/dayjs";

// Set to true to use mock data for UI testing
const USE_MOCK_DATA = true;

export async function GET(request: NextRequest) {
  // Mock data for UI testing
  if (USE_MOCK_DATA) {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "12");
    const year = parseInt(searchParams.get("year") || "2024");

    return NextResponse.json({
      success: true,
      data: {
        salaryHistory: [
          {
            id: 1,
            month: month,
            year: year,
            totalHours: month === 12 ? 176.5 : 160.25,
            hourlySalary: 50000,
            salaryFromHours: month === 12 ? 8825000 : 8012500,
            advance: month === 12 ? 2000000 : 1500000,
            bonus: month === 12 ? 500000 : 1000000,
            penalty: month === 12 ? 0 : 200000,
            total: month === 12 ? 7325000 : 7312500,
            status: "PAID",
            paidAt: `${year}-${String(month).padStart(2, "0")}-28T10:00:00Z`,
            note: "Lương tháng " + month + "/" + year,
          },
        ],
        bonusHistory: [
          {
            id: 1,
            amount: 500000,
            reason: "Thưởng cuối năm",
            description: "Thưởng cho nhân viên xuất sắc trong tháng",
            imageUrl: null,
            note: "Cảm ơn bạn đã làm việc chăm chỉ",
            rewardDate: `${year}-${String(month).padStart(2, "0")}-25T00:00:00Z`,
            status: "PAID",
            createdAt: `${year}-${String(month).padStart(2, "0")}-25T10:00:00Z`,
          },
          {
            id: 2,
            amount: 300000,
            reason: "Thưởng năng suất",
            description: "Hoàn thành vượt chỉ tiêu",
            imageUrl: null,
            note: null,
            rewardDate: `${year}-${String(month).padStart(2, "0")}-15T00:00:00Z`,
            status: "APPROVED",
            createdAt: `${year}-${String(month).padStart(2, "0")}-15T10:00:00Z`,
          },
        ],
        penaltiesHistory: month === 12 ? [
          {
            id: 1,
            amount: 150000,
            reason: "Vi phạm quy định",
            description: "Không tuân thủ quy trình làm việc",
            imageUrl: null,
            note: "Cần cải thiện",
            penaltyDate: `${year}-${String(month).padStart(2, "0")}-10T00:00:00Z`,
            status: "PAID",
            createdAt: `${year}-${String(month).padStart(2, "0")}-10T10:00:00Z`,
          },
          {
            id: 2,
            amount: 100000,
            reason: "Đi muộn",
            description: "Đi muộn 2 lần trong tháng",
            imageUrl: null,
            note: "Vui lòng đến đúng giờ",
            penaltyDate: `${year}-${String(month).padStart(2, "0")}-20T00:00:00Z`,
            status: "APPROVED",
            createdAt: `${year}-${String(month).padStart(2, "0")}-20T10:00:00Z`,
          },
        ] : month === 11 ? [
          {
            id: 3,
            amount: 200000,
            reason: "Đi muộn",
            description: "Đi muộn 3 lần trong tháng",
            imageUrl: null,
            note: "Vui lòng đến đúng giờ",
            penaltyDate: `${year}-${String(month).padStart(2, "0")}-15T00:00:00Z`,
            status: "PAID",
            createdAt: `${year}-${String(month).padStart(2, "0")}-15T10:00:00Z`,
          },
        ] : [],
      },
    });
  }

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
      if (requestedYear === currentYear && requestedMonth === currentMonth - 1) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Chỉ được xem lịch sử của tháng hiện tại hoặc tháng trước" },
        { status: 403 },
      );
    }

    try {
      // Get salary history for the month
      const salaryHistory = await db.$queryRawUnsafe(
        `SELECT 
          id, month, year, totalHours, hourlySalary, salaryFromHours,
          advance, bonus, penalty, total, status, paidAt, note
        FROM StaffSalary 
        WHERE staffId = ? AND month = ? AND year = ?
        ORDER BY createdAt DESC`,
        parseInt(staffId),
        requestedMonth,
        requestedYear,
      ) as any[];

      // Get bonus history for the month
      let bonusHistory: any[] = [];
      try {
        bonusHistory = await db.$queryRawUnsafe(
          `SELECT 
            id, amount, reason, description, imageUrl, note,
            rewardDate, status, createdAt
          FROM StaffBonus 
          WHERE staffId = ? 
            AND YEAR(rewardDate) = ? 
            AND MONTH(rewardDate) = ?
          ORDER BY rewardDate DESC, createdAt DESC`,
          parseInt(staffId),
          requestedYear,
          requestedMonth,
        ) as any[];
      } catch (error: any) {
        if (!error.message?.includes("doesn't exist")) {
          throw error;
        }
      }

      // Get penalties history for the month
      let penaltiesHistory: any[] = [];
      try {
        penaltiesHistory = await db.$queryRawUnsafe(
          `SELECT 
            id, amount, reason, description, imageUrl, note,
            penaltyDate, status, createdAt
          FROM StaffPenalty 
          WHERE staffId = ? 
            AND YEAR(penaltyDate) = ? 
            AND MONTH(penaltyDate) = ?
          ORDER BY penaltyDate DESC, createdAt DESC`,
          parseInt(staffId),
          requestedYear,
          requestedMonth,
        ) as any[];
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
      { success: false, error: error.message || "Failed to fetch salary history" },
      { status: 500 },
    );
  }
}

