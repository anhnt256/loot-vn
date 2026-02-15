import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { loginAndGetMomoToken } from "@/lib/momo-report";

type MomoCredentialRow = {
  id: number;
  shop_id: string | null;
  momo_url: string;
  username: string;
  password: string;
  token: string | null;
  expired: Date | null;
  branch: string;
};

/**
 * GET /api/momo-token?branch=XXX
 * Returns Momo token for specified branch (query param) or current branch (cookie).
 * Uses cached token from MomoCredential if not expired; otherwise logs in via API and updates DB.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchFromQuery = searchParams.get("branch");
    const branchFromCookie = await getBranchFromCookie();
    const branch = branchFromQuery || branchFromCookie;

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch is required (query param or cookie)" },
        { status: 400 }
      );
    }

    const rows = (await db.$queryRawUnsafe(
      "SELECT id, shop_id, momo_url, username, password, token, expired, branch FROM MomoCredential WHERE branch = ? LIMIT 1",
      branch
    )) as MomoCredentialRow[];

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "MomoCredential not found for branch" },
        { status: 404 }
      );
    }

    const row = rows[0];
    const now = new Date();

    // Return cached token if still valid
    if (row.token && row.expired && new Date(row.expired) > now) {
      console.log("[MomoToken] Using cached token for branch:", branch);
      return NextResponse.json({
        success: true,
        token: row.token,
        expired: row.expired,
      });
    }

    // Login and get new token
    console.log("[MomoToken] Logging in to get new token for branch:", branch);
    const result = await loginAndGetMomoToken({
      username: row.username,
      password: row.password,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Momo login failed or token not found" },
        { status: 502 }
      );
    }

    // Update token in DB
    await db.$executeRawUnsafe(
      "UPDATE MomoCredential SET token = ?, expired = ?, updatedAt = NOW() WHERE id = ? AND branch = ?",
      result.token,
      result.expired,
      row.id,
      branch
    );

    console.log("[MomoToken] Token updated in DB for branch:", branch);
    return NextResponse.json({
      success: true,
      token: result.token,
      expired: result.expired,
    });
  } catch (error) {
    console.error("[MomoToken] API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get Momo token",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/momo-token?branch=XXX
 * Force refresh Momo token (ignore cache).
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchFromQuery = searchParams.get("branch");
    const branchFromCookie = await getBranchFromCookie();
    const branch = branchFromQuery || branchFromCookie;

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch is required (query param or cookie)" },
        { status: 400 }
      );
    }

    const rows = (await db.$queryRawUnsafe(
      "SELECT id, shop_id, momo_url, username, password, branch FROM MomoCredential WHERE branch = ? LIMIT 1",
      branch
    )) as MomoCredentialRow[];

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "MomoCredential not found for branch" },
        { status: 404 }
      );
    }

    const row = rows[0];

    // Force login to get new token
    console.log("[MomoToken] Force refreshing token for branch:", branch);
    const result = await loginAndGetMomoToken({
      username: row.username,
      password: row.password,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Momo login failed or token not found" },
        { status: 502 }
      );
    }

    // Update token in DB
    await db.$executeRawUnsafe(
      "UPDATE MomoCredential SET token = ?, expired = ?, updatedAt = NOW() WHERE id = ? AND branch = ?",
      result.token,
      result.expired,
      row.id,
      branch
    );

    console.log("[MomoToken] Token refreshed and updated for branch:", branch);
    return NextResponse.json({
      success: true,
      token: result.token,
      expired: result.expired,
    });
  } catch (error) {
    console.error("[MomoToken] API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to refresh Momo token",
      },
      { status: 500 }
    );
  }
}
