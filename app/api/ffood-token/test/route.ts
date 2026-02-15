import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { loginAndGetToken } from "@/lib/ffood-login";

type FfoodCredentialRow = {
  id: number;
  ffood_url: string;
  username: string;
  password: string;
  token: string | null;
  expired: Date | null;
  branch: string;
};

/**
 * GET /api/ffood-token/test?branch=xxx
 * Test ffood login with Playwright. Headless in production (deploy); headed allowed in dev for debugging.
 * branch: optional query param for Postman; otherwise from cookie.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchParam = searchParams.get("branch");
    const branch = branchParam ?? (await getBranchFromCookie());

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch is required (query ?branch=xxx or cookie)",
        },
        { status: 400 },
      );
    }

    const rows = (await db.$queryRawUnsafe(
      "SELECT id, ffood_url, username, password, token, expired, branch FROM FfoodCredential WHERE branch = ? LIMIT 1",
      branch,
    )) as FfoodCredentialRow[];

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "FfoodCredential not found for branch" },
        { status: 404 },
      );
    }

    const row = rows[0];
    const result = await loginAndGetToken(
      row.ffood_url,
      row.username,
      row.password,
      {
        headless: process.env.NODE_ENV === "production",
        timeout: 60_000,
        keepOpen: process.env.NODE_ENV !== "production",
      },
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Ffood login failed or token not found" },
        { status: 502 },
      );
    }

    await db.$executeRawUnsafe(
      "UPDATE FfoodCredential SET token = ?, expired = ?, updatedAt = NOW() WHERE id = ? AND branch = ?",
      result.token,
      result.expired,
      row.id,
      branch,
    );

    return NextResponse.json({
      success: true,
      message: "Test login OK (browser was headed for debug)",
      token: result.token,
      expired: result.expired,
    });
  } catch (error) {
    console.error("Ffood token test API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 },
    );
  }
}
