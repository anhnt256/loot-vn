import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getCurrentTimeVNISO, getCurrentTimeVNDB } from "@/lib/timezone-utils";
import dayjs from "@/lib/dayjs";

// Set to true to use mock data for UI testing
const USE_MOCK_DATA = true;

// GET: Lấy lịch sử time tracking
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const dateParam = searchParams.get("date");
  const staffId = searchParams.get("staffId");

  // Mock data for UI testing
  if (USE_MOCK_DATA) {
    // If date parameter provided, return today's records with stats
    if (dateParam && staffId) {
      const now = dayjs();
      const todayRecords = [
        {
          id: 1,
          checkInTime: now.set("hour", 8).set("minute", 0).toISOString(),
          checkOutTime: null,
          totalHours: null,
          status: "WORKING",
        },
        {
          id: 2,
          checkInTime: now.set("hour", 6).set("minute", 30).toISOString(),
          checkOutTime: now.set("hour", 7).set("minute", 45).toISOString(),
          totalHours: 1.25,
          status: "COMPLETED",
        },
      ];

      // Calculate stats
      const todayTotal = 1.25 + (now.diff(now.set("hour", 8).set("minute", 0), "hour", true)); // 1.25 + current working hours
      const weekTotal = 45.5; // Mock data
      const monthTotal = 176.5; // Mock data

      return NextResponse.json({
        success: true,
        data: {
          todayRecords: todayRecords,
          stats: {
            todayHours: todayTotal,
            weekHours: weekTotal,
            monthHours: monthTotal,
          },
        },
      });
    }

    const now = dayjs();
    const selectedMonth = month ? parseInt(month) : now.month() + 1;
    const selectedYear = year ? parseInt(year) : now.year();
    
    // Generate history for the selected month
    const startOfMonth = dayjs(`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`);
    const daysInMonth = startOfMonth.daysInMonth();
    const history = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = startOfMonth.date(day);
      const checkIn = date.set("hour", 8 + Math.floor(Math.random() * 2)).set("minute", Math.floor(Math.random() * 30));
      const checkOut = checkIn.add(8 + Math.random() * 2, "hour");
      const hours = parseFloat((8 + Math.random() * 2).toFixed(2));
      const isToday = date.isSame(now, "day");

      history.push({
        id: day,
        date: date.format("YYYY-MM-DD"),
        checkInTime: checkIn.toISOString(),
        checkOutTime: isToday ? null : checkOut.toISOString(),
        totalHours: isToday ? parseFloat((now.diff(checkIn, "hour", true)).toFixed(2)) : hours,
        status: isToday ? "WORKING" : "COMPLETED",
      });
    }
    
    const todayCheckIn = now.set("hour", 8).set("minute", 0).toISOString();

    // Calculate month hours
    const monthHours = history.reduce((sum, record) => sum + (record.totalHours || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        todayRecord: now.month() + 1 === selectedMonth && now.year() === selectedYear ? {
          id: 1,
          staffId: 1,
          checkInTime: todayCheckIn,
          checkOutTime: null,
          createdAt: todayCheckIn,
          updatedAt: todayCheckIn,
        } : null,
        history: history.reverse(), // Show oldest first
        stats: {
          todayHours: now.month() + 1 === selectedMonth && now.year() === selectedYear 
            ? parseFloat(now.diff(dayjs(todayCheckIn), "hour", true).toFixed(2))
            : 0,
          weekHours: 0, // Not used for monthly view
          monthHours: parseFloat(monthHours.toFixed(2)),
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

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const dateParam = searchParams.get("date"); // For today's records

    if (!staffId) {
      return NextResponse.json(
        { success: false, error: "staffId is required" },
        { status: 400 },
      );
    }

    // If date provided, return today's records with stats
    if (dateParam) {
      try {
        const today = dayjs(getCurrentTimeVNISO()).format("YYYY-MM-DD");
        const startOfWeek = dayjs(getCurrentTimeVNISO()).startOf("week").format("YYYY-MM-DD");
        const endOfWeek = dayjs(getCurrentTimeVNISO()).endOf("week").format("YYYY-MM-DD");
        const startOfMonth = dayjs(getCurrentTimeVNISO()).startOf("month").format("YYYY-MM-DD");
        const endOfMonth = dayjs(getCurrentTimeVNISO()).endOf("month").format("YYYY-MM-DD");

        // Get today's records
        const todayRecords = await db.$queryRawUnsafe(
          `SELECT 
            id,
            checkInTime,
            checkOutTime,
            CASE 
              WHEN checkOutTime IS NOT NULL THEN 
                TIMESTAMPDIFF(HOUR, checkInTime, checkOutTime) + 
                TIMESTAMPDIFF(MINUTE, checkInTime, checkOutTime) % 60 / 60.0
              ELSE NULL
            END as totalHours,
            CASE 
              WHEN checkOutTime IS NULL THEN 'WORKING'
              ELSE 'COMPLETED'
            END as status
          FROM StaffTimeTracking 
          WHERE staffId = ? AND DATE(checkInTime) = ?
          ORDER BY checkInTime DESC`,
          parseInt(staffId),
          dateParam,
        ) as any[];

        // Calculate today's total hours
        let todayHours = 0;
        todayRecords.forEach((record: any) => {
          if (record.checkOutTime) {
            todayHours += record.totalHours || 0;
          } else {
            // Still working - calculate from now
            const checkIn = dayjs(record.checkInTime);
            const now = dayjs(getCurrentTimeVNISO());
            todayHours += now.diff(checkIn, "hour", true);
          }
        });

        // Get week's total hours
        const weekRecords = await db.$queryRawUnsafe(
          `SELECT 
            checkInTime,
            checkOutTime,
            CASE 
              WHEN checkOutTime IS NOT NULL THEN 
                TIMESTAMPDIFF(HOUR, checkInTime, checkOutTime) + 
                TIMESTAMPDIFF(MINUTE, checkInTime, checkOutTime) % 60 / 60.0
              ELSE NULL
            END as totalHours
          FROM StaffTimeTracking 
          WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?`,
          parseInt(staffId),
          startOfWeek,
          endOfWeek,
        ) as any[];

        let weekHours = 0;
        weekRecords.forEach((record: any) => {
          if (record.checkOutTime) {
            weekHours += record.totalHours || 0;
          } else {
            // Still working - calculate from now
            const checkIn = dayjs(record.checkInTime);
            const now = dayjs(getCurrentTimeVNISO());
            weekHours += now.diff(checkIn, "hour", true);
          }
        });

        // Get month's total hours
        const monthRecords = await db.$queryRawUnsafe(
          `SELECT 
            checkInTime,
            checkOutTime,
            CASE 
              WHEN checkOutTime IS NOT NULL THEN 
                TIMESTAMPDIFF(HOUR, checkInTime, checkOutTime) + 
                TIMESTAMPDIFF(MINUTE, checkInTime, checkOutTime) % 60 / 60.0
              ELSE NULL
            END as totalHours
          FROM StaffTimeTracking 
          WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?`,
          parseInt(staffId),
          startOfMonth,
          endOfMonth,
        ) as any[];

        let monthHours = 0;
        monthRecords.forEach((record: any) => {
          if (record.checkOutTime) {
            monthHours += record.totalHours || 0;
          } else {
            // Still working - calculate from now
            const checkIn = dayjs(record.checkInTime);
            const now = dayjs(getCurrentTimeVNISO());
            monthHours += now.diff(checkIn, "hour", true);
          }
        });

        return NextResponse.json({
          success: true,
          data: {
            todayRecords: todayRecords || [],
            stats: {
              todayHours: parseFloat(todayHours.toFixed(2)),
              weekHours: parseFloat(weekHours.toFixed(2)),
              monthHours: parseFloat(monthHours.toFixed(2)),
            },
          },
        });
      } catch (error: any) {
        if (error.message?.includes("doesn't exist")) {
          return NextResponse.json({
            success: true,
            data: {
              todayRecords: [],
              stats: {
                todayHours: 0,
                weekHours: 0,
                monthHours: 0,
              },
            },
          });
        }
        throw error;
      }
    }

    // If month/year provided, filter by that month
    let startDate: string;
    let endDate: string;
    
    if (monthParam && yearParam) {
      const selectedMonth = parseInt(monthParam);
      const selectedYear = parseInt(yearParam);
      startDate = dayjs(`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`).format("YYYY-MM-DD");
      endDate = dayjs(`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`).endOf("month").format("YYYY-MM-DD");
    } else {
      // Default to current month
      startDate = dayjs(getCurrentTimeVNISO()).startOf("month").format("YYYY-MM-DD");
      endDate = dayjs(getCurrentTimeVNISO()).endOf("month").format("YYYY-MM-DD");
    }

    const today = dayjs(getCurrentTimeVNISO()).format("YYYY-MM-DD");

    let todayRecord: any[] = [];
    let history: any[] = [];
    let monthRecords: any[] = [];

    try {
      // Get today's record (only if viewing current month)
      if (dayjs(today).isBetween(startDate, endDate, "day", "[]")) {
        todayRecord = await db.$queryRawUnsafe(
          `SELECT * FROM StaffTimeTracking 
           WHERE staffId = ? AND DATE(checkInTime) = ?
           ORDER BY checkInTime DESC LIMIT 1`,
          parseInt(staffId),
          today,
        ) as any[];
      }

      // Get history for the selected month
      history = await db.$queryRawUnsafe(
        `SELECT 
          id,
          DATE(checkInTime) as date,
          checkInTime,
          checkOutTime,
          CASE 
            WHEN checkOutTime IS NOT NULL THEN 
              TIMESTAMPDIFF(HOUR, checkInTime, checkOutTime) + 
              TIMESTAMPDIFF(MINUTE, checkInTime, checkOutTime) % 60 / 60.0
            ELSE NULL
          END as totalHours,
          CASE 
            WHEN checkOutTime IS NULL THEN 'WORKING'
            ELSE 'COMPLETED'
          END as status
        FROM StaffTimeTracking 
        WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?
        ORDER BY checkInTime ASC`,
        parseInt(staffId),
        startDate,
        endDate,
      ) as any[];

      // Calculate month hours
      monthRecords = history;
    } catch (error: any) {
      // Table doesn't exist yet, return empty data
      if (error.message?.includes("doesn't exist")) {
        return NextResponse.json({
          success: true,
          data: {
            todayRecord: null,
            history: [],
            stats: {
              todayHours: 0,
              weekHours: 0,
              monthHours: 0,
            },
          },
        });
      }
      throw error;
    }

    // Calculate stats
    const todayHours = todayRecord[0]?.checkOutTime
      ? parseFloat(
          (
            (new Date(todayRecord[0].checkOutTime).getTime() -
              new Date(todayRecord[0].checkInTime).getTime()) /
            (1000 * 60 * 60)
          ).toFixed(2),
        )
      : todayRecord[0]
      ? parseFloat(
          (
            (new Date().getTime() -
              new Date(todayRecord[0].checkInTime).getTime()) /
            (1000 * 60 * 60)
          ).toFixed(2),
        )
      : 0;

    const monthHours = monthRecords.reduce((total, record) => {
      const hours = record.totalHours || 0;
      return total + hours;
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        todayRecord: todayRecord[0] || null,
        history: history,
        stats: {
          todayHours: parseFloat(todayHours.toFixed(2)),
          weekHours: 0, // Not used for monthly view
          monthHours: parseFloat(monthHours.toFixed(2)),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching time tracking:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch time tracking" },
      { status: 500 },
    );
  }
}

// POST: Check-in or Check-out
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { staffId, action } = body;

    if (!staffId || !action) {
      return NextResponse.json(
        { success: false, error: "staffId and action are required" },
        { status: 400 },
      );
    }

    try {
      if (action === "checkin") {
        // Allow multiple check-ins per day - just create new record with Vietnam time
        const nowVN = getCurrentTimeVNDB();
        await db.$executeRawUnsafe(
          `INSERT INTO StaffTimeTracking (staffId, checkInTime, createdAt, updatedAt)
           VALUES (?, ?, ?, ?)`,
          parseInt(staffId),
          nowVN,
          nowVN,
          nowVN,
        );

        return NextResponse.json({
          success: true,
          message: "Check-in thành công",
        });
      } else if (action === "checkout") {
        const { recordId } = body;
        
        if (!recordId) {
          return NextResponse.json(
            { success: false, error: "recordId is required" },
            { status: 400 },
          );
        }

        // Find the specific record
        const existing = await db.$queryRawUnsafe(
          `SELECT * FROM StaffTimeTracking 
           WHERE id = ? AND staffId = ? AND checkOutTime IS NULL
           LIMIT 1`,
          parseInt(recordId),
          parseInt(staffId),
        ) as any[];

        if (existing.length === 0) {
          return NextResponse.json(
            { success: false, error: "Không tìm thấy record check-in hoặc đã checkout" },
            { status: 400 },
          );
        }

        // Update check-out time with Vietnam time
        const nowVN = getCurrentTimeVNDB();
        await db.$executeRawUnsafe(
          `UPDATE StaffTimeTracking 
           SET checkOutTime = ?, updatedAt = ?
           WHERE id = ?`,
          nowVN,
          nowVN,
          parseInt(recordId),
        );

        return NextResponse.json({
          success: true,
          message: "Check-out thành công",
        });
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 },
        );
      }
    } catch (error: any) {
      // Table doesn't exist yet
      if (error?.message?.includes("doesn't exist")) {
        return NextResponse.json(
          {
            success: false,
            error: "Hệ thống chưa sẵn sàng. Vui lòng liên hệ admin để tạo bảng dữ liệu.",
          },
          { status: 503 },
        );
      }
      
      // Return error message only, not the entire error object
      const errorMessage = error?.message || "Failed to process time tracking";
      console.error("Error in time tracking:", errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 },
      );
    }
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to process time tracking";
    console.error("Error in time tracking POST:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

