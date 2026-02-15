import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { loginAndGetToken } from "@/lib/ffood-login";
import {
  getFfoodTokenCookieName,
  getFfoodExpiredCookieName,
} from "@/lib/ffood-token-utils";

type FfoodCredentialRow = {
  id: number;
  ffood_url: string;
  username: string;
  password: string;
  token: string | null;
  expired: Date | null;
  branch: string;
};

function setFfoodTokenCookies(
  res: NextResponse,
  branch: string,
  token: string,
  expired: Date,
): void {
  const tokenName = getFfoodTokenCookieName(branch);
  const expiredName = getFfoodExpiredCookieName(branch);
  const expiredStr =
    typeof expired === "string" ? expired : expired.toISOString();
  const maxAge = 86400; // 24h
  res.cookies.set(tokenName, token, {
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.cookies.set(expiredName, expiredStr, {
    maxAge,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

/**
 * GET /api/ffood-token?branch=xxx
 * Returns ffood token for branch (from query param or cookie).
 * Uses cached token from FfoodCredential if not expired; otherwise logs in via Playwright and updates DB.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchParam = searchParams.get("branch");
    const branch = branchParam ?? (await getBranchFromCookie());
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch is required" },
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
    const now = new Date();
    if (row.token && row.expired && new Date(row.expired) > now) {
      const res = NextResponse.json({
        success: true,
        token: row.token,
        expired: row.expired,
      });
      setFfoodTokenCookies(res, branch, row.token, row.expired);
      return res;
    }

    const result = await loginAndGetToken(
      row.ffood_url,
      row.username,
      row.password,
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

    const res = NextResponse.json({
      success: true,
      token: result.token,
      expired: result.expired,
    });
    setFfoodTokenCookies(res, branch, result.token, result.expired);
    return res;
  } catch (error) {
    console.error("Ffood token API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get ffood token",
      },
      { status: 500 },
    );
  }
}
