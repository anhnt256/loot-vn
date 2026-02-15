import { NextRequest, NextResponse } from "next/server";
import { getBranchFromCookie } from "@/lib/server-utils";
import { verifyFfoodShifts } from "@/lib/ffood-shift-verify";

/**
 * GET /api/ffood-shift-verify?reportDate=YYYY-MM-DD&branch=GO_VAP
 * Test API: verify shift data from FFood pos-api for a given report date.
 * - reportDate: date of report (e.g. 2026-02-01). API date param = reportDate - 1 day at 17:00 UTC.
 * - branch: optional, defaults to cookie. Uses FfoodCredential (token, shop_id) for branch.
 * Returns: raw shifts from API, WorkShift list, verified rows (employee.id matched to WorkShift.ffood_id)
 *          with totalFood (cash+deduct), deduction (deduct), actualFfood (cash).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportDateParam = searchParams.get("reportDate");
    const branch =
      searchParams.get("branch")?.trim() || (await getBranchFromCookie());

    if (!reportDateParam?.trim()) {
      return NextResponse.json(
        { success: false, error: "reportDate is required (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    const reportDate = reportDateParam.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
      return NextResponse.json(
        { success: false, error: "reportDate must be YYYY-MM-DD" },
        { status: 400 },
      );
    }

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "branch is required (query or cookie)" },
        { status: 400 },
      );
    }

    const result = await verifyFfoodShifts(branch, reportDate);
    return NextResponse.json(result);
  } catch (error) {
    console.error("ffood-shift-verify API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Verify failed",
      },
      { status: 500 },
    );
  }
}
