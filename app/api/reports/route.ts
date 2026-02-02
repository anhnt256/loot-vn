import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { getCurrentTimeVNISO, getCurrentTimeVNDB } from "@/lib/timezone-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const branch = await getBranchFromCookie();

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch not found in cookie" },
        { status: 401 },
      );
    }

    const {
      date,
      shift,
      // Financial fields
      playtimeMoney = 0,
      serviceMoney = 0,
      momo = 0,
      expenses = 0,
      // Staff fields
      counterStaffId,
      kitchenStaffId,
      securityStaffId,
      // Notes
      notes = null,
      // File URL (optional)
      fileUrl = null,
      // Inter-shift expense (optional, UI shows in detail)
      interShiftExpenseAmount = 0,
      interShiftExpenseSourceShift = null,
      interShiftExpenseSourceDate = null,
    } = body;

    // Validate required fields
    if (
      !date ||
      !shift ||
      !counterStaffId ||
      !kitchenStaffId ||
      !securityStaffId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: date, shift, counterStaffId, kitchenStaffId, securityStaffId are required.",
        },
        { status: 400 },
      );
    }

    // Validate staff IDs are valid numbers
    if (isNaN(Number(counterStaffId)) || Number(counterStaffId) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid counterStaffId. Must be a positive number.",
        },
        { status: 400 },
      );
    }

    if (isNaN(Number(kitchenStaffId)) || Number(kitchenStaffId) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid kitchenStaffId. Must be a positive number.",
        },
        { status: 400 },
      );
    }

    if (isNaN(Number(securityStaffId)) || Number(securityStaffId) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid securityStaffId. Must be a positive number.",
        },
        { status: 400 },
      );
    }

    // Parse date using timezone-utils
    const currentTime = getCurrentTimeVNISO();

    // Use the input date directly since it's already in YYYY-MM-DD format
    const dateVN = date;

    console.log("Creating report:", {
      inputDate: date,
      dateVN: dateVN,
      currentTime: currentTime,
      shift: shift,
      playtimeMoney,
      serviceMoney,
      momo,
      expenses,
      counterStaffId,
      kitchenStaffId,
      securityStaffId,
    });

    // Check if report already exists for this exact date and shift
    const existingReports = (await db.$queryRaw`
      SELECT r.id, r.date, r.shift, r.branch, DATE(r.date) as dateVN
      FROM Report r
      WHERE r.shift = ${shift} AND r.branch = ${branch} AND DATE(r.date) = ${dateVN}
      ORDER BY r.createdAt DESC
    `) as any[];

    console.log("Existing reports for this date and shift:", existingReports);

    if (existingReports.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Báo cáo cho ca ${shift} ngày ${date} đã tồn tại.`,
        },
        { status: 400 },
      );
    }

    let reportId: number = 0;

    // Use transaction to create report and details
    await db.$transaction(async (tx) => {
      // Create new report
      // Build JSON metadata in fileUrl to store optional fields (e.g., inter-shift expense)
      let meta: any = {};
      try {
        if (fileUrl && typeof fileUrl === "string") {
          // try parse incoming JSON string
          meta = JSON.parse(fileUrl);
        } else if (fileUrl && typeof fileUrl === "object") {
          meta = fileUrl;
        }
      } catch {}

      const interShiftAmountNum = parseFloat(interShiftExpenseAmount || 0);
      if (!Number.isNaN(interShiftAmountNum) && interShiftAmountNum > 0) {
        meta.interShiftExpense = {
          amount: interShiftAmountNum,
          sourceShift: interShiftExpenseSourceShift,
          sourceDate: interShiftExpenseSourceDate,
        };
      }

      const fileUrlSqlValue = `'${JSON.stringify(meta).replace(/'/g, "''")}'`;

      await tx.$executeRawUnsafe(`
        INSERT INTO Report (
          date, shift, branch, fileUrl, note, 
          counterStaffId, kitchenStaffId, securityStaffId, 
          createdAt, updatedAt
        )
        VALUES (
          '${date}', '${shift}', '${branch}', 
          ${fileUrlSqlValue}, 
          ${notes ? `'${(notes as string).replace(/'/g, "''")}'` : "NULL"}, 
          ${Number(counterStaffId)}, 
          ${Number(kitchenStaffId)}, 
          ${Number(securityStaffId)}, 
          '${getCurrentTimeVNDB()}', '${getCurrentTimeVNDB()}'
        )
      `);

      // Get the created report ID
      const createdReport = (await tx.$queryRaw`
        SELECT id FROM Report 
        WHERE DATE(date) = ${dateVN} AND shift = ${shift} AND branch = ${branch}
        ORDER BY createdAt DESC LIMIT 1
      `) as any[];
      reportId = createdReport[0].id;

      // Create report details for financial data
      const details = [
        { type: "GIO", value: parseFloat(playtimeMoney || 0) },
        { type: "DICH_VU", value: parseFloat(serviceMoney || 0) },
        { type: "MOMO", value: parseFloat(momo || 0) },
        { type: "CHI", value: parseFloat(expenses || 0) },
        {
          type: "TONG",
          value:
            parseFloat(playtimeMoney || 0) +
            parseFloat(serviceMoney || 0) +
            parseFloat(momo || 0) -
            parseFloat(expenses || 0),
        },
      ];

      // Note: inter-shift expense kept only in fileUrl JSON metadata to avoid schema changes

      for (const detail of details) {
        await tx.$executeRawUnsafe(`
          INSERT INTO ReportDetail (
            reportId, type, value
          )
          VALUES (
            ${reportId}, '${detail.type}', ${detail.value}
          )
        `);
      }
    });

    // Check if revenue + service money meets threshold and create bonuses
    const totalRevenue =
      parseFloat(playtimeMoney || 0) + parseFloat(serviceMoney || 0);

    // Get threshold from env based on branch and shift
    const shiftUpper = shift.toUpperCase();
    const branchUpper = branch.toUpperCase();

    let threshold = 0;
    if (shiftUpper === "SANG") {
      threshold = parseFloat(
        process.env[`NEXT_PUBLIC_MORNING_TARGET_${branchUpper}`] || "0",
      );
    } else if (shiftUpper === "CHIEU") {
      threshold = parseFloat(
        process.env[`NEXT_PUBLIC_AFTERNOON_TARGET_${branchUpper}`] || "0",
      );
    } else if (shiftUpper === "TOI") {
      threshold = parseFloat(
        process.env[`NEXT_PUBLIC_EVENING_TARGET_${branchUpper}`] || "0",
      );
    }

    console.log("Checking bonus eligibility:", {
      totalRevenue,
      threshold,
      shift: shiftUpper,
      branch: branchUpper,
    });

    // If threshold is met, create bonuses for counter and kitchen staff
    if (threshold > 0 && totalRevenue >= threshold) {
      const nowVN = getCurrentTimeVNDB();
      // Use dateVN with time set to end of day for rewardDate
      const rewardDate = `${dateVN} 23:59:59`;
      const bonusAmount = parseFloat(process.env.NEXT_PUBLIC_BONUS || "0");
      const reason = `Thưởng đạt doanh số ca ${shiftUpper} ngày ${dateVN}`;
      const description = `Thưởng đạt chỉ tiêu doanh thu ca ${shiftUpper} ngày ${dateVN}. Tổng doanh thu + dịch vụ: ${totalRevenue.toLocaleString("vi-VN")} VNĐ.`;

      try {
        // Verify staff exists and belongs to branch before creating bonus
        const counterStaff = (await db.$queryRawUnsafe(
          `SELECT id FROM Staff WHERE id = ? AND branch = ? AND isDeleted = false`,
          parseInt(counterStaffId),
          branch,
        )) as any[];

        const kitchenStaff = (await db.$queryRawUnsafe(
          `SELECT id FROM Staff WHERE id = ? AND branch = ? AND isDeleted = false`,
          parseInt(kitchenStaffId),
          branch,
        )) as any[];

        // Create bonus for counter staff (Quầy) if exists
        if (counterStaff.length > 0) {
          await db.$executeRawUnsafe(
            `INSERT INTO StaffBonus (staffId, amount, reason, description, rewardDate, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
            parseInt(counterStaffId),
            bonusAmount,
            reason,
            description,
            rewardDate,
            nowVN,
            nowVN,
          );
          console.log(
            `Created bonus for counter staff ${counterStaffId} with amount ${bonusAmount}`,
          );
        } else {
          console.warn(
            `Counter staff ${counterStaffId} not found in branch ${branch}`,
          );
        }

        // Create bonus for kitchen staff (Bếp) if exists
        if (kitchenStaff.length > 0) {
          await db.$executeRawUnsafe(
            `INSERT INTO StaffBonus (staffId, amount, reason, description, rewardDate, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
            parseInt(kitchenStaffId),
            bonusAmount,
            reason,
            description,
            rewardDate,
            nowVN,
            nowVN,
          );
          console.log(
            `Created bonus for kitchen staff ${kitchenStaffId} with amount ${bonusAmount}`,
          );
        } else {
          console.warn(
            `Kitchen staff ${kitchenStaffId} not found in branch ${branch}`,
          );
        }
      } catch (bonusError) {
        console.error("Error creating bonuses:", bonusError);
        // Don't fail the report creation if bonus creation fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: reportId,
        total:
          parseFloat(playtimeMoney || 0) +
          parseFloat(serviceMoney || 0) +
          parseFloat(momo || 0) -
          parseFloat(expenses || 0),
      },
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create report" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const branch = await getBranchFromCookie();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift");

    let query = `
      SELECT 
        r.id, r.date, r.shift, r.branch, r.note, r.fileUrl,
        r.counterStaffId, r.kitchenStaffId, r.securityStaffId,
        r.createdAt, r.updatedAt,
        cs.fullName as counterStaffName,
        ks.fullName as kitchenStaffName,
        ss.fullName as securityStaffName
      FROM Report r
      LEFT JOIN Staff cs ON r.counterStaffId = cs.id
      LEFT JOIN Staff ks ON r.kitchenStaffId = ks.id
      LEFT JOIN Staff ss ON r.securityStaffId = ss.id
      WHERE r.branch = '${branch}'
    `;

    if (date) {
      // Nếu có filter date thì lấy theo ngày đó
      query += ` AND DATE(r.date) = '${date}'`;
    } else {
      // Nếu không có filter date thì chỉ lấy 15 ngày gần nhất
      const currentDate = getCurrentTimeVNISO().split("T")[0];
      const fifteenDaysAgo = new Date(currentDate);
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      const fifteenDaysAgoStr = fifteenDaysAgo.toISOString().split("T")[0];
      query += ` AND DATE(r.date) >= '${fifteenDaysAgoStr}'`;
    }

    if (shift) {
      query += ` AND r.shift = '${shift}'`;
    }

    query += ` ORDER BY r.date DESC, r.createdAt DESC`;

    const reports = (await db.$queryRawUnsafe(query)) as any[];

    // Parse fileUrl JSON to object for FE convenience
    for (const r of reports) {
      try {
        if (typeof r.fileUrl === "string" && r.fileUrl.trim().length) {
          r.fileUrl = JSON.parse(r.fileUrl);
        }
      } catch {
        // keep as-is if parse fails
      }
    }

    // Get details for each report
    for (const report of reports) {
      const details = (await db.$queryRaw`
        SELECT type, value FROM ReportDetail WHERE reportId = ${report.id}
      `) as any[];

      report.details = details.reduce((acc: any, detail: any) => {
        acc[detail.type] = detail.value;
        return acc;
      }, {});
    }

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
