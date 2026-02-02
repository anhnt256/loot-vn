import { NextRequest, NextResponse } from "next/server";
import { getFnetDB } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Check both token and staffToken
    const token =
      request.cookies.get("token")?.value ||
      request.cookies.get("staffToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId =
      typeof payload.userId === "string"
        ? parseInt(payload.userId)
        : payload.userId;

    // Get wallet info from Fnet database
    const fnetDB = await getFnetDB();

    const walletResult = await fnetDB.$queryRaw<any[]>`
      SELECT main, sub FROM wallettb 
      WHERE userid = ${userId}
      LIMIT 1
    `;

    if (walletResult.length === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const wallet = walletResult[0];
    const main = Number(wallet.main) || 0;
    const sub = Number(wallet.sub) || 0;

    return NextResponse.json({
      wallet: {
        main,
        sub,
        total: main + sub,
      },
    });
  } catch (error) {
    console.error("[User Wallet GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
