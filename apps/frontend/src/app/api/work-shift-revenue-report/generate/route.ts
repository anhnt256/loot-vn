import { NextResponse } from "next/server";
import { db, getFnetDBByBranch } from "@gateway-workspace/database";
import { verifyFfoodShifts } from "@gateway-workspace/shared/utils";
import {
  getMomoStatisticsByShift,
  loginAndGetMomoToken,
} from "@gateway-workspace/shared/utils";
import { mapWorkShiftNameToShiftEnum, WorkShift } from "@gateway-workspace/shared/utils";

type WorkShiftRow = {
  id: number;
  name: string;
  startTime: string | Date;
  endTime: string | Date;
  isOvernight: number; // 0 or 1 from DB
  FnetStaffId: number | null;
};

type MomoCredentialRow = {
  id: number;
  store_id: string | null;
  merchant_id: number | null;
  username: string;
  password: string;
  token: string | null;
  expired: Date | null;
  branch: string;
};

type ShiftRevenueType = "MORNING" | "AFTERNOON" | "EVENING";

// Helper to delay execution (rate limiting for Momo API)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MOMO_RATE_LIMIT_DELAY = 6000; // 6 seconds between Momo API calls

function workShiftNameToShiftRevenueType(name: string): ShiftRevenueType {
  const s = mapWorkShiftNameToShiftEnum(name).toUpperCase();
  if (s === "SANG") return "MORNING";
  if (s === "CHIEU") return "AFTERNOON";
  if (s === "TOI") return "EVENING";
  return "MORNING"; // fallback
}

// Map WorkShift name to Report.shift enum (SANG, CHIEU, TOI)
function workShiftNameToReportShift(name: string): string {
  return mapWorkShiftNameToShiftEnum(name).toUpperCase(); // SANG, CHIEU, TOI
}

type GenerateResult = {
  shift: ShiftRevenueType;
  workShiftId: number;
  workShiftName: string;
  totalFood: number;
  deduction: number;
  actualFfood: number;
  gamingRevenue: number;
  momoRevenue: number;
  incidentalAmount: number;
  handoverAmount: number;
  status: "inserted" | "updated" | "skipped";
  errors?: string[];
};

/**
 * POST /api/work-shift-revenue-report/generate
 * Body: { date: "YYYY-MM-DD", branch: "GO_VAP" | "TAN_PHU" }
 *
 * Generates WorkShiftRevenueReport for all shifts on a given date.
 * - Ffood: totalFood, deduction, actualFfood
 * - Fnet: gamingRevenue (SUM Amount from paymenttb)
 * - Momo: momoRevenue (totalSuccessAmount)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, branch } = body;

    if (!date || !branch) {
      return NextResponse.json(
        { success: false, error: "date and branch are required" },
        { status: 400 },
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: "date must be in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    console.log(`[GenerateReport] Starting for date=${date}, branch=${branch}`);

    // 1. Get all WorkShifts for branch
    const workShiftRows = (await db.$queryRawUnsafe(
      `SELECT id, name, startTime, endTime, isOvernight, FnetStaffId 
       FROM WorkShift WHERE branch = ? ORDER BY startTime, id`,
      branch,
    )) as WorkShiftRow[];

    if (!workShiftRows.length) {
      return NextResponse.json(
        { success: false, error: "No WorkShift found for branch" },
        { status: 404 },
      );
    }

    console.log(`[GenerateReport] Found ${workShiftRows.length} work shifts`);

    // 2. Get Ffood data (values need to be divided by 100)
    const ffoodResult = await verifyFfoodShifts(branch, date);
    const ffoodByShiftName = new Map<
      string,
      { totalFood: number; deduction: number; actualFfood: number }
    >();

    if (ffoodResult.success && ffoodResult.verified) {
      for (const v of ffoodResult.verified) {
        ffoodByShiftName.set(v.workShiftName, {
          totalFood: Math.round(v.totalFood / 100),
          deduction: Math.round(v.deduction / 100),
          actualFfood: Math.round(v.actualFfood / 100),
        });
      }
    }
    console.log(
      `[GenerateReport] Ffood data:`,
      ffoodResult.success
        ? `${ffoodResult.verified?.length || 0} shifts`
        : ffoodResult.error,
    );

    // 2.5. Get incidentalAmount from ReportDetail (type = 'CHI') by shift
    const incidentalRows = (await db.$queryRawUnsafe(
      `SELECT r.shift, COALESCE(SUM(rd.value), 0) AS incidentalAmount
       FROM Report r
       LEFT JOIN ReportDetail rd ON rd.reportId = r.id AND rd.type = 'CHI'
       WHERE DATE(r.date) = ? AND r.branch = ?
       GROUP BY r.shift`,
      date,
      branch,
    )) as { shift: string; incidentalAmount: number }[];

    const incidentalByShift = new Map<string, number>();
    for (const row of incidentalRows) {
      incidentalByShift.set(row.shift, Number(row.incidentalAmount) || 0);
    }
    console.log(
      `[GenerateReport] Incidental data:`,
      Object.fromEntries(incidentalByShift),
    );

    // 3. Get Momo credential and token (refresh if expired)
    const momoRows = (await db.$queryRawUnsafe(
      `SELECT id, store_id, merchant_id, username, password, token, expired, branch 
       FROM MomoCredential WHERE branch = ? LIMIT 1`,
      branch,
    )) as MomoCredentialRow[];

    const momoCred = momoRows[0];
    let momoToken = momoCred?.token;
    const momoMerchantId = momoCred?.merchant_id?.toString();
    const momoStoreId = momoCred?.store_id;

    // Check if token is expired or missing, then refresh
    if (momoCred && momoMerchantId && momoStoreId) {
      const now = new Date();
      const isExpired =
        !momoToken || !momoCred.expired || new Date(momoCred.expired) <= now;

      if (isExpired) {
        console.log(
          `[GenerateReport] Momo token expired or missing, refreshing...`,
        );
        const loginResult = await loginAndGetMomoToken({
          username: momoCred.username,
          password: momoCred.password,
        });

        if (loginResult) {
          momoToken = loginResult.token;
          // Update token in DB
          await db.$executeRawUnsafe(
            `UPDATE MomoCredential SET token = ?, expired = ?, updatedAt = NOW() WHERE id = ?`,
            loginResult.token,
            loginResult.expired,
            momoCred.id,
          );
          console.log(`[GenerateReport] Momo token refreshed successfully`);
        } else {
          console.log(`[GenerateReport] Failed to refresh Momo token`);
          momoToken = null;
        }
      }
    }

    const hasMomoCred = momoToken && momoMerchantId && momoStoreId;
    if (!hasMomoCred) {
      console.log(
        `[GenerateReport] Momo credential incomplete for branch ${branch}`,
      );
    }

    // 4. Get Fnet DB
    const fnetDB = getFnetDBByBranch(branch);

    // 5. Process each shift
    const results: GenerateResult[] = [];
    let momoCallCount = 0;

    for (const ws of workShiftRows) {
      const shiftType = workShiftNameToShiftRevenueType(ws.name);
      const reportShift = workShiftNameToReportShift(ws.name); // SANG, CHIEU, TOI
      const errors: string[] = [];

      // Ffood data
      const ffoodData = ffoodByShiftName.get(ws.name) || {
        totalFood: 0,
        deduction: 0,
        actualFfood: 0,
      };

      // Incidental amount from ReportDetail (type = 'CHI')
      const incidentalAmount = incidentalByShift.get(reportShift) || 0;

      // Calculate handoverAmount = totalFood + gamingRevenue - deduction - incidentalAmount - momoRevenue
      // Note: momoRevenue will be calculated later, so we'll compute handoverAmount after getting momoRevenue

      // Fnet gaming revenue
      let gamingRevenue = 0;
      if (ws.FnetStaffId) {
        try {
          const sumResult = (await fnetDB.$queryRawUnsafe(
            `SELECT COALESCE(SUM(Amount), 0) AS total FROM fnet.paymenttb WHERE StaffId = ? AND ServeDate = ?`,
            Number(ws.FnetStaffId),
            date,
          )) as { total: unknown }[];
          gamingRevenue =
            sumResult[0]?.total != null ? Number(sumResult[0].total) : 0;
        } catch (err) {
          errors.push(
            `Fnet error: ${err instanceof Error ? err.message : "unknown"}`,
          );
        }
      }

      // Momo revenue
      let momoRevenue = 0;
      if (hasMomoCred) {
        try {
          // Rate limiting: delay before calling Momo API (except first call)
          if (momoCallCount > 0) {
            console.log(
              `[GenerateReport] Waiting ${MOMO_RATE_LIMIT_DELAY / 1000}s before next Momo API call...`,
            );
            await delay(MOMO_RATE_LIMIT_DELAY);
          }
          momoCallCount++;

          // Convert WorkShiftRow to WorkShift format
          // startTime/endTime from DB may be Date object, need to format to HH:mm:ss
          const formatTime = (t: string | Date): string => {
            if (t instanceof Date) {
              return t.toTimeString().slice(0, 8); // "HH:mm:ss"
            }
            return String(t);
          };

          const shift: WorkShift = {
            id: ws.id,
            name: ws.name,
            startTime: formatTime(ws.startTime),
            endTime: formatTime(ws.endTime),
            isOvernight: ws.isOvernight === 1,
            branch,
          };

          const momoStats = await getMomoStatisticsByShift({
            token: momoToken!,
            merchantId: momoMerchantId!,
            storeId: momoStoreId!,
            shift,
            date,
          });

          if (momoStats) {
            momoRevenue = momoStats.totalSuccessAmount;
          }
        } catch (err) {
          errors.push(
            `Momo error: ${err instanceof Error ? err.message : "unknown"}`,
          );
        }
      }

      // Calculate handoverAmount = totalFood + gamingRevenue - deduction - incidentalAmount - momoRevenue
      const handoverAmount =
        ffoodData.totalFood +
        gamingRevenue -
        ffoodData.deduction -
        incidentalAmount -
        momoRevenue;

      // 6. Upsert to WorkShiftRevenueReport
      let status: "inserted" | "updated" | "skipped" = "skipped";

      try {
        // Check if record exists
        const existingRows = (await db.$queryRawUnsafe(
          `SELECT id FROM WorkShiftRevenueReport WHERE reportDate = ? AND branch = ? AND shift = ?`,
          date,
          branch,
          shiftType,
        )) as { id: number }[];

        if (existingRows.length > 0) {
          // Update
          await db.$executeRawUnsafe(
            `UPDATE WorkShiftRevenueReport 
             SET totalFood = ?, deduction = ?, actualFfood = ?, gamingRevenue = ?, momoRevenue = ?, incidentalAmount = ?, handoverAmount = ?, updatedAt = NOW()
             WHERE reportDate = ? AND branch = ? AND shift = ?`,
            ffoodData.totalFood,
            ffoodData.deduction,
            ffoodData.actualFfood,
            gamingRevenue,
            momoRevenue,
            incidentalAmount,
            handoverAmount,
            date,
            branch,
            shiftType,
          );
          status = "updated";
        } else {
          // Insert
          await db.$executeRawUnsafe(
            `INSERT INTO WorkShiftRevenueReport 
             (reportDate, branch, shift, totalFood, deduction, actualFfood, gamingRevenue, momoRevenue, incidentalAmount, handoverAmount, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            date,
            branch,
            shiftType,
            ffoodData.totalFood,
            ffoodData.deduction,
            ffoodData.actualFfood,
            gamingRevenue,
            momoRevenue,
            incidentalAmount,
            handoverAmount,
          );
          status = "inserted";
        }
      } catch (err) {
        errors.push(
          `DB error: ${err instanceof Error ? err.message : "unknown"}`,
        );
        status = "skipped";
      }

      results.push({
        shift: shiftType,
        workShiftId: ws.id,
        workShiftName: ws.name,
        totalFood: ffoodData.totalFood,
        deduction: ffoodData.deduction,
        actualFfood: ffoodData.actualFfood,
        gamingRevenue,
        momoRevenue,
        incidentalAmount,
        handoverAmount,
        status,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    console.log(
      `[GenerateReport] Completed for date=${date}, branch=${branch}`,
    );

    return NextResponse.json({
      success: true,
      date,
      branch,
      results,
      summary: {
        total: results.length,
        inserted: results.filter((r) => r.status === "inserted").length,
        updated: results.filter((r) => r.status === "updated").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        withErrors: results.filter((r) => r.errors?.length).length,
      },
    });
  } catch (error) {
    console.error("[GenerateReport] API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate report",
      },
      { status: 500 },
    );
  }
}
