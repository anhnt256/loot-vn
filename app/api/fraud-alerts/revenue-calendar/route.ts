import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

interface RevenueReportRow {
  reportDate: Date;
  shift: string;
  totalFood: string | number;
  gamingRevenue: string | number;
  deduction: string | number;
  incidentalAmount: string | number | null;
  momoRevenue: string | number;
  handoverAmount: string | number;
  actualShiftRevenue: string | number;
  confirmedHeldAmount: string | number;
}

interface DayData {
  date: string; // YYYY-MM-DD
  totalHandover: number; // Sum of handoverAmount from WorkShiftRevenueReport (display this on calendar)
  totalActualMoney: number; // totalFood + gamingRevenue - deduction (per day sum)
  totalMomo: number; // Sum of momoRevenue for all shifts
  totalActual: number; // Sum of actualShiftRevenue for all shifts
  totalConfirmedHeld: number; // Sum of confirmedHeldAmount
  managerAmount: number; // Sum of amount from ManagerIncomeExpense for this day
  difference: number; // totalHandover - totalActual - totalConfirmedHeld (internal report diff)
  hasAlert: boolean; // true when managerAmount != totalHandover (ManagerIncomeExpense vs WorkShiftRevenueReport)
  shifts: {
    shift: string;
    totalFood: number;
    gamingRevenue: number;
    deduction: number;
    actualMoney: number; // totalFood + gamingRevenue - deduction - incidentalAmount
    momoRevenue: number;
    handoverAmount: number;
    actualShiftRevenue: number;
    confirmedHeldAmount: number;
    difference: number;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());

    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    // Get first and last day of the month
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    // Query WorkShiftRevenueReport for the month
    const rows = (await db.$queryRawUnsafe(
      `SELECT 
        reportDate,
        shift,
        totalFood,
        gamingRevenue,
        deduction,
        incidentalAmount,
        momoRevenue,
        handoverAmount,
        actualShiftRevenue,
        confirmedHeldAmount
       FROM WorkShiftRevenueReport
       WHERE branch = ? AND reportDate >= ? AND reportDate <= ?
       ORDER BY reportDate, shift`,
      branch,
      startDate,
      endDate
    )) as RevenueReportRow[];

    // Group by date
    const dataByDate = new Map<string, DayData>();

    // Initialize all days in month
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      dataByDate.set(dateStr, {
        date: dateStr,
        totalHandover: 0,
        totalActualMoney: 0,
        totalMomo: 0,
        totalActual: 0,
        totalConfirmedHeld: 0,
        managerAmount: 0,
        difference: 0,
        hasAlert: false,
        shifts: [],
      });
    }

    // Query ManagerIncomeExpense: sum(amount) per day for this month
    const managerRows = (await db.$queryRawUnsafe(
      `SELECT DATE(transactionDate) as dt, SUM(amount) as totalAmount
       FROM ManagerIncomeExpense
       WHERE branch = ? AND transactionDate >= ? AND transactionDate <= ?
       GROUP BY DATE(transactionDate)`,
      branch,
      startDate,
      endDate
    )) as { dt: Date | string; totalAmount: string | number }[];

    const managerByDate = new Map<string, number>();
    for (const r of managerRows) {
      const dateStr = r.dt instanceof Date ? r.dt.toISOString().slice(0, 10) : String(r.dt).slice(0, 10);
      managerByDate.set(dateStr, Number(r.totalAmount) || 0);
    }

    // Process rows
    for (const row of rows) {
      const dateStr = row.reportDate instanceof Date
        ? row.reportDate.toISOString().slice(0, 10)
        : String(row.reportDate).slice(0, 10);

      const dayData = dataByDate.get(dateStr);
      if (!dayData) continue;

      const totalFood = Number(row.totalFood) || 0;
      const gamingRevenue = Number(row.gamingRevenue) || 0;
      const deduction = Number(row.deduction) || 0;
      const incidentalAmount = row.incidentalAmount != null ? Number(row.incidentalAmount) : 0;
      const actualMoney = totalFood + gamingRevenue - deduction - incidentalAmount;
      const handover = Number(row.handoverAmount) || 0;
      const actual = Number(row.actualShiftRevenue) || 0;
      const heldAmount = Number(row.confirmedHeldAmount) || 0;
      const diff = handover - actual - heldAmount;

      const momoRevenue = Number(row.momoRevenue) || 0;

      dayData.shifts.push({
        shift: row.shift,
        totalFood,
        gamingRevenue,
        deduction,
        actualMoney,
        momoRevenue,
        handoverAmount: handover,
        actualShiftRevenue: actual,
        confirmedHeldAmount: heldAmount,
        difference: diff,
      });

      dayData.totalHandover += handover;
      dayData.totalActualMoney += actualMoney;
      dayData.totalMomo += momoRevenue;
      dayData.totalActual += actual;
      dayData.totalConfirmedHeld += heldAmount;
    }

    // Set managerAmount per day and calculate alerts: ManagerIncomeExpense.amount vs WorkShiftRevenueReport.handoverAmount
    let totalMonthHandover = 0;
    let totalMonthActualMoney = 0;
    let totalMonthMomo = 0;
    let totalMonthActual = 0;
    let alertCount = 0;
    const TOLERANCE = 1000; // 1000 VND to avoid float noise

    for (const [, dayData] of dataByDate) {
      dayData.managerAmount = managerByDate.get(dayData.date) ?? 0;
      dayData.difference = dayData.totalHandover - dayData.totalActual - dayData.totalConfirmedHeld;
      // Alert when manager recorded amount != report handover total (the comparison user asked for)
      dayData.hasAlert = Math.abs(dayData.managerAmount - dayData.totalHandover) > TOLERANCE;
      if (dayData.hasAlert) alertCount++;

      totalMonthHandover += dayData.totalHandover;
      totalMonthActualMoney += dayData.totalActualMoney;
      totalMonthMomo += dayData.totalMomo;
      totalMonthActual += dayData.totalActual;
    }

    // Convert map to array sorted by date
    const calendarData = Array.from(dataByDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        branch,
        startDate,
        endDate,
        days: calendarData,
        summary: {
          totalDays: lastDay,
          daysWithData: calendarData.filter(d => d.shifts.length > 0).length,
          alertCount,
          totalMonthHandover,
          totalMonthActualMoney,
          totalMonthMomo,
          totalMonthActual,
          totalMonthDifference: totalMonthHandover - totalMonthActual,
        },
      },
    });
  } catch (error) {
    console.error("[RevenueCalendar] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch calendar data",
      },
      { status: 500 }
    );
  }
}
