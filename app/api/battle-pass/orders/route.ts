import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { getBranchFromCookie } from "@/lib/server-utils";

export async function GET(request: NextRequest) {
  try {
    // Get branch from cookie
    const branch = await getBranchFromCookie();

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query based on filters
    let query = `
      SELECT 
        o.id,
        o.userId,
        o.packageId,
        o.price,
        o.branch,
        o.status,
        o.createdAt,
        o.approvedAt,
        o.approvedBy,
        o.note,
        u.userName,
        p.seasonId,
        s.name as seasonName,
        approver.userName as approverName
      FROM BattlePassPremiumOrder o
      LEFT JOIN User u ON o.userId = u.userId AND u.branch = o.branch
      INNER JOIN BattlePassPremiumPackage p ON o.packageId = p.id
      LEFT JOIN BattlePassSeason s ON p.seasonId = s.id
      LEFT JOIN User approver ON o.approvedBy = approver.userId AND approver.branch = o.branch
    `;

    const whereConditions = [];

    // Always filter by branch from cookie
    if (branch) {
      whereConditions.push(`o.branch = '${branch}'`);
    }

    if (status && status !== "ALL") {
      whereConditions.push(`o.status = '${status}'`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    query += ` ORDER BY o.createdAt DESC LIMIT 500`;

    const orders = await db.$queryRawUnsafe<any[]>(query);

    const transformedOrders = orders.map((order) => ({
      id: Number(order.id),
      userId: Number(order.userId),
      userName: order.userName,
      packageId: Number(order.packageId),
      seasonName: order.seasonName,
      price: Number(order.price),
      branch: order.branch,
      status: order.status,
      createdAt: order.createdAt,
      approvedAt: order.approvedAt,
      approvedBy: order.approvedBy ? Number(order.approvedBy) : null,
      approverName: order.approverName,
      note: order.note,
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
