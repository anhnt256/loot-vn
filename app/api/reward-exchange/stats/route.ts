import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);
    const branchFromQuery = searchParams.get("branch");
    const branchFromCookie = cookieStore.get("branch")?.value;
    const branch = branchFromQuery || branchFromCookie;
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!branch) {
      return NextResponse.json(
        { error: "Branch is required" },
        { status: 400 },
      );
    }

    // Tạo điều kiện date filter nếu có
    let dateFilter = {};

    if (startDate && endDate) {
      // Sử dụng date range
      dateFilter = {
        createdAt: {
          gte: new Date(startDate + "T00:00:00.000Z"),
          lte: new Date(endDate + "T23:59:59.999Z"),
        },
      };
    } else if (date) {
      // Fallback cho single date (backward compatibility)
      dateFilter = {
        createdAt: {
          gte: new Date(date + "T00:00:00.000Z"),
          lt: new Date(date + "T23:59:59.999Z"),
        },
      };
    }

    const [pending, approved, rejected, total] = await Promise.all([
      db.userRewardMap.count({
        where: {
          branch: branch,
          status: "INITIAL",
          userId: {
            not: null,
          },
          ...dateFilter,
        },
      }),
      db.userRewardMap.count({
        where: {
          branch: branch,
          status: "APPROVE",
          userId: {
            not: null,
          },
          ...dateFilter,
        },
      }),
      db.userRewardMap.count({
        where: {
          branch: branch,
          status: "REJECT",
          userId: {
            not: null,
          },
          ...dateFilter,
        },
      }),
      db.userRewardMap.count({
        where: {
          branch: branch,
          userId: {
            not: null,
          },
          ...dateFilter,
        },
      }),
    ]);

    return NextResponse.json({
      pending,
      approved,
      rejected,
      total,
    });
  } catch (error) {
    console.error("[REWARD_EXCHANGE_STATS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
