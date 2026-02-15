import { NextRequest, NextResponse } from "next/server";
import { getBranchFromCookie } from "@/lib/server-utils";
import { db } from "@/lib/db";
import { fetchMomoReportInBackground } from "@/lib/momo-report";

/**
 * GET: Start Momo report fetch in background.
 * Branch from query ?branch= or cookie. Uses MomoCredential by branch.
 * API returns immediately.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchParam = searchParams.get("branch")?.trim();
    const branch = branchParam ?? (await getBranchFromCookie());
    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch is required (query ?branch= or cookie)",
        },
        { status: 400 },
      );
    }

    const cred = await db.momoCredential.findFirst({
      where: { branch },
      select: { momoUrl: true, username: true, password: true },
    });

    if (!cred?.momoUrl) {
      return NextResponse.json(
        { success: false, error: "MomoCredential not found for branch" },
        { status: 404 },
      );
    }

    fetchMomoReportInBackground({
      momoUrl: cred.momoUrl,
      username: cred.username,
      password: cred.password,
    });

    return NextResponse.json({
      success: true,
      started: true,
      message: "Momo report fetch started in background.",
    });
  } catch (e) {
    console.error("[momo-report] API error:", e);
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}
