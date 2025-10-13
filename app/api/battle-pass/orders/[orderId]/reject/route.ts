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
    const orderId = parseInt(params.orderId);

    const body = await request.json();
    const { note } = body;

    if (!note) {
      return NextResponse.json(
        { error: "Rejection note is required" },
        { status: 400 },
      );
    }

    // Get order details
    const orderResult = await db.$queryRaw<any[]>`
      SELECT o.*
      FROM BattlePassPremiumOrder o
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

    const now = getCurrentTimeVNDB();

    // Update order status to REJECTED
    await db.$queryRaw`
      UPDATE BattlePassPremiumOrder
      SET status = 'REJECTED',
          approvedAt = ${now},
          approvedBy = ${adminUserId},
          note = ${note}
      WHERE id = ${orderId}
    `;

    console.log(
      `❌ Order #${orderId} rejected by admin ${adminUserId}. Reason: ${note}`,
    );

    return NextResponse.json({
      success: true,
      message: "Order rejected successfully",
      orderId: orderId,
    });
  } catch (error) {
    console.error("❌ Error rejecting order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
