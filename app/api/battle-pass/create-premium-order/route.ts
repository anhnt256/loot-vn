import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { getBranchFromCookie } from "@/lib/server-utils";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    const branch = await getBranchFromCookie();

    // Get request body
    const body = await request.json();
    const { packageId, seasonId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 },
      );
    }

    // Verify package exists and get price
    const packageResult = await db.$queryRaw<any[]>`
      SELECT id, basePrice, maxQuantity
      FROM BattlePassPremiumPackage
      WHERE id = ${packageId}
    `;

    if (!packageResult || packageResult.length === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const premiumPackage = packageResult[0];

    // Check if user already has a pending or approved order for this season
    const existingOrderResult = await db.$queryRaw<any[]>`
      SELECT o.id, o.status
      FROM BattlePassPremiumOrder o
      INNER JOIN BattlePassPremiumPackage p ON o.packageId = p.id
      WHERE o.userId = ${userId}
        AND o.branch = ${branch}
        AND p.seasonId = ${seasonId}
        AND o.status IN ('PENDING', 'APPROVED')
      LIMIT 1
    `;

    if (existingOrderResult && existingOrderResult.length > 0) {
      const existingOrder = existingOrderResult[0];
      if (existingOrder.status === "APPROVED") {
        return NextResponse.json(
          { error: "You already purchased premium for this season" },
          { status: 400 },
        );
      } else if (existingOrder.status === "PENDING") {
        return NextResponse.json(
          { error: "You already have a pending order for this season" },
          { status: 400 },
        );
      }
    }

    // Check if package has maxQuantity limit
    if (premiumPackage.maxQuantity) {
      const soldCountResult = await db.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM BattlePassPremiumOrder
        WHERE packageId = ${packageId}
          AND status = 'APPROVED'
      `;

      const soldCount = Number(soldCountResult[0].count);
      const remaining = Number(premiumPackage.maxQuantity) - soldCount;

      if (remaining <= 0) {
        return NextResponse.json(
          { error: "Package is sold out" },
          { status: 400 },
        );
      }
    }

    // Create order with PENDING status
    const createOrderResult = await db.$queryRaw<any[]>`
      INSERT INTO BattlePassPremiumOrder (userId, packageId, price, branch, status, createdAt)
      VALUES (${userId}, ${packageId}, ${premiumPackage.basePrice}, ${branch}, 'PENDING', NOW())
    `;

    // Get the created order ID
    const orderIdResult = await db.$queryRaw<any[]>`
      SELECT LAST_INSERT_ID() as orderId
    `;

    const orderId = Number(orderIdResult[0].orderId);

    // Fetch the created order details
    const createdOrderResult = await db.$queryRaw<any[]>`
      SELECT o.*, p.basePrice as packagePrice, p.seasonId
      FROM BattlePassPremiumOrder o
      INNER JOIN BattlePassPremiumPackage p ON o.packageId = p.id
      WHERE o.id = ${orderId}
    `;

    const createdOrder = createdOrderResult[0];

    console.log(
      `✅ Created Premium Battle Pass Order #${orderId} for user ${userId}, branch ${branch}, status: PENDING`,
    );

    return NextResponse.json({
      success: true,
      order: {
        id: Number(createdOrder.id),
        userId: Number(createdOrder.userId),
        packageId: Number(createdOrder.packageId),
        price: Number(createdOrder.price),
        branch: createdOrder.branch,
        status: createdOrder.status,
        createdAt: createdOrder.createdAt,
        seasonId: Number(createdOrder.seasonId),
      },
      message: "Order created successfully. Waiting for approval.",
    });
  } catch (error) {
    console.error("❌ Error creating premium order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
