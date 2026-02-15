import { NextRequest, NextResponse } from "next/server";
import { getBranchFromCookie } from "@/lib/server-utils";
import { verifyFnetShifts } from "@/lib/fnet-shift-verify";

/**
 * GET /api/fnet-shift-verify?date=YYYY-MM-DD&branch=GO_VAP
 * Verify Fnet paymenttb vs WorkShiftRevenueReport.gamingRevenue.
 * - date: ServeDate (e.g. 2026-01-31).
 * - branch: optional, defaults to cookie.
 * - Uses WorkShift.FnetStaffId to query fnet.paymenttb SUM(Amount) per staff per date.
 * - Maps result to gamingRevenue by shift (SANG->MORNING, CHIEU->AFTERNOON, TOI->EVENING).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const branch =
      searchParams.get("branch")?.trim() || (await getBranchFromCookie());

    if (!dateParam?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "date is required (YYYY-MM-DD, maps to ServeDate)",
        },
        { status: 400 },
      );
    }

    const serveDate = dateParam.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(serveDate)) {
      return NextResponse.json(
        { success: false, error: "date must be YYYY-MM-DD" },
        { status: 400 },
      );
    }

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "branch is required (query or cookie)" },
        { status: 400 },
      );
    }

    const result = await verifyFnetShifts(branch, serveDate);
    return NextResponse.json(result);
  } catch (error) {
    console.error("fnet-shift-verify API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Verify failed",
      },
      { status: 500 },
    );
  }
}
