import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

// Set to true to use mock data for UI testing
const USE_MOCK_DATA = true;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  // Mock data for UI testing
  if (USE_MOCK_DATA) {
    const selectedMonth = month ? parseInt(month) : 12;
    const selectedYear = year ? parseInt(year) : 2024;

    // Filter data by month/year
    const salaryForMonth =
      selectedMonth === 12
        ? {
            id: 1,
            month: 12,
            year: 2024,
            totalHours: 176.5,
            hourlySalary: 50000,
            salaryFromHours: 8825000, // 176.5 * 50000
            advance: 2000000,
            bonus: 500000,
            penalty: 0,
            total: 7325000,
            status: "PAID",
            paidAt: "2024-12-31T10:00:00Z",
            note: null,
          }
        : {
            id: 2,
            month: 11,
            year: 2024,
            totalHours: 160.25,
            hourlySalary: 50000,
            salaryFromHours: 8012500, // 160.25 * 50000
            advance: 1500000,
            bonus: 1000000,
            penalty: 200000,
            total: 7312500,
            status: "PAID",
            paidAt: "2024-11-30T10:00:00Z",
            note: null,
          };

    const bonusForMonth =
      selectedMonth === 12
        ? [
            {
              id: 1,
              amount: 500000,
              reason: "Thưởng cuối năm",
              description: "Thưởng cho nhân viên xuất sắc",
              imageUrl: null,
              note: "Cảm ơn bạn đã làm việc chăm chỉ",
              rewardDate: "2024-12-25T00:00:00Z",
              status: "PAID",
              createdAt: "2024-12-25T10:00:00Z",
            },
          ]
        : [
            {
              id: 2,
              amount: 1000000,
              reason: "Thưởng tháng 11",
              description: "Hoàn thành tốt công việc",
              imageUrl: null,
              note: null,
              rewardDate: "2024-11-30T00:00:00Z",
              status: "PAID",
              createdAt: "2024-11-30T10:00:00Z",
            },
          ];

    const penaltiesForMonth =
      selectedMonth === 12
        ? [
            {
              id: 1,
              amount: 150000,
              reason: "Vi phạm quy định",
              description: "Không tuân thủ quy trình làm việc",
              imageUrl: null,
              note: "Cần cải thiện",
              penaltyDate: "2024-12-10T00:00:00Z",
              status: "PAID",
              createdAt: "2024-12-10T10:00:00Z",
            },
            {
              id: 2,
              amount: 100000,
              reason: "Đi muộn",
              description: "Đi muộn 2 lần trong tháng",
              imageUrl: null,
              note: "Vui lòng đến đúng giờ",
              penaltyDate: "2024-12-20T00:00:00Z",
              status: "APPROVED",
              createdAt: "2024-12-20T10:00:00Z",
            },
          ]
        : selectedMonth === 11
          ? [
              {
                id: 3,
                amount: 200000,
                reason: "Đi muộn",
                description: "Đi muộn 3 lần trong tháng",
                imageUrl: null,
                note: "Vui lòng đến đúng giờ",
                penaltyDate: "2024-11-15T00:00:00Z",
                status: "PAID",
                createdAt: "2024-11-15T10:00:00Z",
              },
            ]
          : [];

    return NextResponse.json({
      success: true,
      data: {
        salaryHistory: [salaryForMonth],
        bonusHistory: bonusForMonth,
        penaltiesHistory: penaltiesForMonth,
        summary: {
          totalHours: salaryForMonth.totalHours || 0,
          salary: salaryForMonth.salaryFromHours || 0,
          bonus: bonusForMonth.reduce((sum, b) => sum + b.amount, 0),
          penalty: penaltiesForMonth
            .filter((p) => p.status === "PAID" || p.status === "APPROVED")
            .reduce((sum, p) => sum + p.amount, 0),
          netSalary:
            (salaryForMonth.salaryFromHours || 0) +
            bonusForMonth.reduce((sum, b) => sum + b.amount, 0) -
            penaltiesForMonth
              .filter((p) => p.status === "PAID" || p.status === "APPROVED")
              .reduce((sum, p) => sum + p.amount, 0),
        },
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

    const staffId = searchParams.get("staffId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!staffId) {
      return NextResponse.json(
        { success: false, error: "staffId is required" },
        { status: 400 },
      );
    }

    // Get salary history - filter by month/year if provided
    let salaryQuery = `SELECT 
        id, month, year, totalHours, hourlySalary, salaryFromHours,
        advance, bonus, penalty, total, status, paidAt, note
      FROM StaffSalary 
      WHERE staffId = ?`;

    const queryParams: any[] = [parseInt(staffId)];

    if (month && year) {
      salaryQuery += ` AND month = ? AND year = ?`;
      queryParams.push(parseInt(month), parseInt(year));
    } else {
      salaryQuery += ` ORDER BY year DESC, month DESC LIMIT 12`;
    }

    const salaryHistory = (await db.$queryRawUnsafe(
      salaryQuery,
      ...queryParams,
    )) as any[];

    // Get bonus history - filter by month/year if provided
    let bonusHistory: any[] = [];
    try {
      let bonusQuery = `SELECT 
          id, amount, reason, description, imageUrl, note,
          rewardDate, status, createdAt
        FROM StaffBonus 
        WHERE staffId = ?`;

      const bonusParams: any[] = [parseInt(staffId)];

      if (month && year) {
        bonusQuery += ` AND YEAR(rewardDate) = ? AND MONTH(rewardDate) = ?`;
        bonusParams.push(parseInt(year), parseInt(month));
      }

      bonusQuery += ` ORDER BY rewardDate DESC, createdAt DESC LIMIT 20`;

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

    // Get penalties history - filter by month/year if provided
    let penaltiesHistory: any[] = [];
    try {
      let penaltyQuery = `SELECT 
          id, amount, reason, description, imageUrl, note,
          penaltyDate, status, createdAt
        FROM StaffPenalty 
        WHERE staffId = ?`;

      const penaltyParams: any[] = [parseInt(staffId)];

      if (month && year) {
        penaltyQuery += ` AND YEAR(penaltyDate) = ? AND MONTH(penaltyDate) = ?`;
        penaltyParams.push(parseInt(year), parseInt(month));
      }

      penaltyQuery += ` ORDER BY penaltyDate DESC, createdAt DESC LIMIT 20`;

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

    // Calculate summary for the selected month
    const salaryForMonth = salaryHistory.length > 0 ? salaryHistory[0] : null;

    const totalHours = salaryForMonth?.totalHours || 0;
    const salary = salaryForMonth?.salaryFromHours || 0;

    const bonus = bonusHistory
      .filter((b) => b.status === "PAID" || b.status === "APPROVED")
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    const penalty = penaltiesHistory
      .filter((p) => p.status === "PAID" || p.status === "APPROVED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

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
          summary: {
            totalSalary: 0,
            totalBonus: 0,
            pendingSalary: 0,
            pendingBonus: 0,
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
