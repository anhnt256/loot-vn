import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const branch = await getBranchFromCookie();

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
          '${currentTime}', '${currentTime}'
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
      query += ` AND DATE(r.date) = '${date}'`;
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
