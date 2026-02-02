import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getCurrentTimeVNISO, getCurrentTimeVNDB } from "@/lib/timezone-utils";
import dayjs from "@/lib/dayjs";

// GET: Lấy lịch sử time tracking
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
        const startOfWeek = dayjs(getCurrentTimeVNISO())
          .startOf("week")
          .format("YYYY-MM-DD");
        const endOfWeek = dayjs(getCurrentTimeVNISO())
          .endOf("week")
          .format("YYYY-MM-DD");
        const startOfMonth = dayjs(getCurrentTimeVNISO())
          .startOf("month")
          .format("YYYY-MM-DD");
        const endOfMonth = dayjs(getCurrentTimeVNISO())
          .endOf("month")
          .format("YYYY-MM-DD");

        // Get today's records - ensure we only get records from the specified date
        // Use DATE() function to compare dates correctly
        const todayRecords = (await db.$queryRawUnsafe(
          `SELECT 
            id,
            checkInTime,
            checkOutTime,
            CASE 
              WHEN checkOutTime IS NOT NULL THEN 'COMPLETED'
              ELSE 'WORKING'
            END as status
          FROM StaffTimeTracking 
          WHERE staffId = ? AND DATE(checkInTime) = DATE(?)
          ORDER BY checkInTime DESC`,
          parseInt(staffId),
          dateParam,
        )) as any[];

        console.log(
          `[DEBUG] Query dateParam: ${dateParam}, Found ${todayRecords.length} records`,
        );

        // Calculate today's total hours
        // DB stores datetime as VN time, but MySQL/Prisma returns as ISO UTC string or Date object
        // If checkOutTime is null (still working), set it to current time before calculation
        let todayHours = 0;
        const now = dayjs().tz("Asia/Ho_Chi_Minh");

        todayRecords.forEach((record: any) => {
          // Parse checkInTime - handle both string and Date object
          let checkInStr = record.checkInTime;
          if (checkInStr instanceof Date) {
            checkInStr = checkInStr.toISOString();
          }
          if (typeof checkInStr !== "string") {
            checkInStr = String(checkInStr);
          }
          // Extract "YYYY-MM-DDTHH:mm:ss" from ISO string (remove .000Z)
          const checkInDateStr = checkInStr.split(".")[0]; // "2026-01-12T02:40:55"
          const checkIn = dayjs(checkInDateStr).utcOffset(7, true); // Parse as VN time

          // If checkOutTime is null, set it to current time
          let checkOut = now;
          if (record.checkOutTime) {
            let checkOutStr = record.checkOutTime;
            if (checkOutStr instanceof Date) {
              checkOutStr = checkOutStr.toISOString();
            }
            if (typeof checkOutStr !== "string") {
              checkOutStr = String(checkOutStr);
            }
            const checkOutDateStr = checkOutStr.split(".")[0];
            checkOut = dayjs(checkOutDateStr).utcOffset(7, true);
          }

          // Calculate diff: checkOut - checkIn
          const diffHours = checkOut.diff(checkIn, "hour", true);
          const hours = Math.abs(diffHours);
          todayHours += hours;
          console.log(
            `[DEBUG] ${record.checkOutTime ? "Completed" : "Working"}: ${checkInStr} -> ${record.checkOutTime || "now"} = ${hours.toFixed(2)}h (${(hours * 60).toFixed(0)} min)`,
          );
        });
        console.log(
          `[DEBUG] Total todayHours: ${todayHours.toFixed(2)}h (${(todayHours * 60).toFixed(0)} min), Records: ${todayRecords.length}`,
        );

        // Get week's total hours
        const weekRecords = (await db.$queryRawUnsafe(
          `SELECT 
            checkInTime,
            checkOutTime
          FROM StaffTimeTracking 
          WHERE staffId = ? AND DATE(checkInTime) >= ? AND DATE(checkInTime) <= ?`,
          parseInt(staffId),
          startOfWeek,
          endOfWeek,
        )) as any[];

        let weekHours = 0;
        const nowWeek = dayjs().tz("Asia/Ho_Chi_Minh");
        weekRecords.forEach((record: any) => {
          // Parse checkInTime
          let checkInStr = record.checkInTime;
          if (checkInStr instanceof Date) {
            checkInStr = checkInStr.toISOString();
          }
          if (typeof checkInStr !== "string") {
            checkInStr = String(checkInStr);
          }
          const checkInDateStr = checkInStr.split(".")[0];
          const checkIn = dayjs(checkInDateStr).utcOffset(7, true);

          // If checkOutTime is null, set it to current time
          let checkOut = nowWeek;
          if (record.checkOutTime) {
            let checkOutStr = record.checkOutTime;
            if (checkOutStr instanceof Date) {
              checkOutStr = checkOutStr.toISOString();
            }
            if (typeof checkOutStr !== "string") {
              checkOutStr = String(checkOutStr);
            }
            const checkOutDateStr = checkOutStr.split(".")[0];
            checkOut = dayjs(checkOutDateStr).utcOffset(7, true);
          }

          // Calculate diff
          const diffHours = checkOut.diff(checkIn, "hour", true);
          weekHours += Math.abs(diffHours);
        });

        // Get month's total hours
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

        let monthHours = 0;
        const nowMonth = dayjs().tz("Asia/Ho_Chi_Minh");
        monthRecords.forEach((record: any) => {
          // Parse checkInTime
          let checkInStr = record.checkInTime;
          if (checkInStr instanceof Date) {
            checkInStr = checkInStr.toISOString();
          }
          if (typeof checkInStr !== "string") {
            checkInStr = String(checkInStr);
          }
          const checkInDateStr = checkInStr.split(".")[0];
          const checkIn = dayjs(checkInDateStr).utcOffset(7, true);

          // If checkOutTime is null, set it to current time
          let checkOut = nowMonth;
          if (record.checkOutTime) {
            let checkOutStr = record.checkOutTime;
            if (checkOutStr instanceof Date) {
              checkOutStr = checkOutStr.toISOString();
            }
            if (typeof checkOutStr !== "string") {
              checkOutStr = String(checkOutStr);
            }
            const checkOutDateStr = checkOutStr.split(".")[0];
            checkOut = dayjs(checkOutDateStr).utcOffset(7, true);
          }

          // Calculate diff
          const diffHours = checkOut.diff(checkIn, "hour", true);
          monthHours += Math.abs(diffHours);
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
      startDate = dayjs(
        `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
      ).format("YYYY-MM-DD");
      endDate = dayjs(
        `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
      )
        .endOf("month")
        .format("YYYY-MM-DD");
    } else {
      // Default to current month
      startDate = dayjs(getCurrentTimeVNISO())
        .startOf("month")
        .format("YYYY-MM-DD");
      endDate = dayjs(getCurrentTimeVNISO())
        .endOf("month")
        .format("YYYY-MM-DD");
    }

    const today = dayjs(getCurrentTimeVNISO()).format("YYYY-MM-DD");

    let todayRecord: any[] = [];
    let history: any[] = [];
    let monthRecords: any[] = [];

    try {
      // Get today's record (only if viewing current month)
      const todayDayjs = dayjs(today);
      if (
        (todayDayjs.isAfter(startDate) && todayDayjs.isBefore(endDate)) ||
        todayDayjs.isSame(startDate, "day") ||
        todayDayjs.isSame(endDate, "day")
      ) {
        todayRecord = (await db.$queryRawUnsafe(
          `SELECT * FROM StaffTimeTracking 
           WHERE staffId = ? AND DATE(checkInTime) = ?
           ORDER BY checkInTime DESC LIMIT 1`,
          parseInt(staffId),
          today,
        )) as any[];
      }

      // Get history for the selected month
      const rawHistory = (await db.$queryRawUnsafe(
        `SELECT 
          id,
          DATE(checkInTime) as date,
          checkInTime,
          checkOutTime,
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
      )) as any[];

      // Calculate totalHours for each record using dayjs
      const nowMonth = dayjs().tz("Asia/Ho_Chi_Minh");
      history = rawHistory.map((record: any) => {
        // Parse checkInTime
        let checkInStr = record.checkInTime;
        if (checkInStr instanceof Date) {
          checkInStr = checkInStr.toISOString();
        }
        if (typeof checkInStr !== "string") {
          checkInStr = String(checkInStr);
        }
        const checkInDateStr = checkInStr.split(".")[0];
        const checkIn = dayjs(checkInDateStr).utcOffset(7, true);

        // If checkOutTime is null, set it to current time
        let checkOut = nowMonth;
        if (record.checkOutTime) {
          let checkOutStr = record.checkOutTime;
          if (checkOutStr instanceof Date) {
            checkOutStr = checkOutStr.toISOString();
          }
          if (typeof checkOutStr !== "string") {
            checkOutStr = String(checkOutStr);
          }
          const checkOutDateStr = checkOutStr.split(".")[0];
          checkOut = dayjs(checkOutDateStr).utcOffset(7, true);
        }

        // Calculate totalHours
        const diffHours = checkOut.diff(checkIn, "hour", true);
        const totalHours = Math.abs(diffHours);

        return {
          ...record,
          totalHours: parseFloat(totalHours.toFixed(2)), // Ensure it's a number
        };
      });

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
    // Calculate todayHours from all records in today (not just todayRecord[0])
    const todayDate = dayjs(getCurrentTimeVNISO()).format("YYYY-MM-DD");
    const nowStats = dayjs().tz("Asia/Ho_Chi_Minh");
    let todayHours = 0;

    // Get all records from today
    const todayRecordsFromHistory = history.filter((record: any) => {
      const recordDate = dayjs(record.date).format("YYYY-MM-DD");
      return recordDate === todayDate;
    });

    // Calculate total hours from all today's records
    todayRecordsFromHistory.forEach((record: any) => {
      // Parse checkInTime
      let checkInStr = record.checkInTime;
      if (checkInStr instanceof Date) {
        checkInStr = checkInStr.toISOString();
      }
      if (typeof checkInStr !== "string") {
        checkInStr = String(checkInStr);
      }
      const checkInDateStr = checkInStr.split(".")[0];
      const checkIn = dayjs(checkInDateStr).utcOffset(7, true);

      // If checkOutTime is null, set it to current time
      let checkOut = nowStats;
      if (record.checkOutTime) {
        let checkOutStr = record.checkOutTime;
        if (checkOutStr instanceof Date) {
          checkOutStr = checkOutStr.toISOString();
        }
        if (typeof checkOutStr !== "string") {
          checkOutStr = String(checkOutStr);
        }
        const checkOutDateStr = checkOutStr.split(".")[0];
        checkOut = dayjs(checkOutDateStr).utcOffset(7, true);
      }

      // Calculate diff
      const diffHours = checkOut.diff(checkIn, "hour", true);
      todayHours += Math.abs(diffHours);
    });

    const monthHours = monthRecords.reduce((total, record) => {
      const hours = record.totalHours || 0;
      return total + Math.abs(hours); // Ensure positive
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
      {
        success: false,
        error: error?.message || "Failed to fetch time tracking",
      },
      { status: 500 },
    );
  }
}

// POST: Check-in or Check-out
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
        // Check if there's already a working session (no checkout)
        const existingWorking = (await db.$queryRawUnsafe(
          `SELECT id FROM StaffTimeTracking 
           WHERE staffId = ? AND checkOutTime IS NULL
           LIMIT 1`,
          parseInt(staffId),
        )) as any[];

        if (existingWorking.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Bạn đang có ca làm việc chưa check-out. Vui lòng check-out trước khi check-in mới.",
            },
            { status: 400 },
          );
        }

        // Only allow one working session at a time
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
        const existing = (await db.$queryRawUnsafe(
          `SELECT * FROM StaffTimeTracking 
           WHERE id = ? AND staffId = ? AND checkOutTime IS NULL
           LIMIT 1`,
          parseInt(recordId),
          parseInt(staffId),
        )) as any[];

        if (existing.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Không tìm thấy record check-in hoặc đã checkout",
            },
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
            error:
              "Hệ thống chưa sẵn sàng. Vui lòng liên hệ admin để tạo bảng dữ liệu.",
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
