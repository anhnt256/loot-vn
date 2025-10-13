import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { getBranchFromCookie } from "@/lib/server-utils";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.role || decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const adminUserId = decoded.userId;
    const adminBranch = await getBranchFromCookie();
    const orderId = parseInt(params.orderId);

    const body = await request.json();
    const { note } = body;

    // Get order details
    const orderResult = await db.$queryRaw<any[]>`
      SELECT o.*, p.seasonId
      FROM BattlePassPremiumOrder o
      INNER JOIN BattlePassPremiumPackage p ON o.packageId = p.id
      WHERE o.id = ${orderId}
    `;

    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderResult[0];

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: `Order is already ${order.status}` },
        { status: 400 },
      );
    }

    // Check if user already has premium for this season
    const existingPremiumResult = await db.$queryRaw<any[]>`
      SELECT bp.id
      FROM UserBattlePass bp
      INNER JOIN BattlePassSeason s ON bp.seasonId = s.id
      WHERE bp.userId = ${order.userId}
        AND bp.branch = ${order.branch}
        AND s.id = ${order.seasonId}
        AND bp.isPremium = 1
      LIMIT 1
    `;

    if (existingPremiumResult && existingPremiumResult.length > 0) {
      return NextResponse.json(
        { error: "User already has premium for this season" },
        { status: 400 },
      );
    }

    const now = getCurrentTimeVNDB();

    // Update order status to APPROVED
    await db.$queryRaw`
      UPDATE BattlePassPremiumOrder
      SET status = 'APPROVED',
          approvedAt = ${now},
          approvedBy = ${adminUserId},
          note = ${note || null}
      WHERE id = ${orderId}
    `;

    // Update user's battle pass progress to premium
    await db.$queryRaw`
      UPDATE UserBattlePass
      SET isPremium = 1
      WHERE userId = ${order.userId}
        AND branch = ${order.branch}
        AND seasonId = ${order.seasonId}
    `;

    console.log(
      `✅ Order #${orderId} approved by admin ${adminUserId}. User ${order.userId} (${order.branch}) now has premium for season ${order.seasonId}`,
    );

    return NextResponse.json({
      success: true,
      message: "Order approved successfully",
      orderId: orderId,
    });
  } catch (error) {
    console.error("❌ Error approving order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
