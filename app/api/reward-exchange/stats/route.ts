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
    let dateFilter = "";

    if (startDate && endDate) {
      // Sử dụng date range
      dateFilter = `AND createdAt >= '${startDate}T00:00:00.000Z' AND createdAt <= '${endDate}T23:59:59.999Z'`;
    } else if (date) {
      // Fallback cho single date (backward compatibility)
      dateFilter = `AND createdAt >= '${date}T00:00:00.000Z' AND createdAt < '${date}T23:59:59.999Z'`;
    }

    const [pending, approved, rejected, total] = await Promise.all([
      db.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*) as count FROM UserRewardMap 
        WHERE branch = '${branch}' 
          AND status = 'INITIAL' 
          AND userId IS NOT NULL
          ${dateFilter}
      `),
      db.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*) as count FROM UserRewardMap 
        WHERE branch = '${branch}' 
          AND status = 'APPROVE' 
          AND userId IS NOT NULL
          ${dateFilter}
      `),
      db.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*) as count FROM UserRewardMap 
        WHERE branch = '${branch}' 
          AND status = 'REJECT' 
          AND userId IS NOT NULL
          ${dateFilter}
      `),
      db.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*) as count FROM UserRewardMap 
        WHERE branch = '${branch}' 
          AND userId IS NOT NULL
          ${dateFilter}
      `),
    ]);

    return NextResponse.json({
      pending: Number(pending[0].count),
      approved: Number(approved[0].count),
      rejected: Number(rejected[0].count),
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error("[REWARD_EXCHANGE_STATS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
