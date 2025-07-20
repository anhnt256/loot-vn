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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const offset = (page - 1) * limit;

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
      dateFilter = `AND urm.createdAt >= '${startDate}T00:00:00.000Z' AND urm.createdAt <= '${endDate}T23:59:59.999Z'`;
    } else if (date) {
      // Fallback cho single date (backward compatibility)
      dateFilter = `AND urm.createdAt >= '${date}T00:00:00.000Z' AND urm.createdAt < '${date}T23:59:59.999Z'`;
    }

    let statusFilter = "";
    if (status && status !== "ALL") {
      statusFilter = `AND urm.status = '${status}'`;
    }

    // Get UserRewardMap records with pagination
    const allUserRewardMaps = await db.$queryRawUnsafe<any[]>(`
      SELECT 
        urm.*,
        r.id as reward_id,
        r.name as reward_name,
        r.value as reward_value,
        u.id as user_id,
        u.userId as user_userId,
        u.userName as user_userName,
        u.stars as user_stars,
        u.branch as user_branch,
        ush.id as userStarHistory_id,
        ush.oldStars as userStarHistory_oldStars,
        ush.newStars as userStarHistory_newStars,
        ush.createdAt as userStarHistory_createdAt
      FROM UserRewardMap urm
      LEFT JOIN Reward r ON urm.rewardId = r.id
      LEFT JOIN User u ON urm.userId = u.id AND u.branch = '${branch}'
      LEFT JOIN UserStarHistory ush ON ush.targetId = urm.id 
        AND ush.branch = '${branch}' 
        AND ush.type = 'REWARD'
        AND urm.status = 'APPROVE'
      WHERE urm.branch = '${branch}'
        ${dateFilter}
        ${statusFilter}
      ORDER BY urm.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get total count
    const totalResult = await db.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as count FROM UserRewardMap urm
      WHERE urm.branch = '${branch}'
        ${dateFilter}
        ${statusFilter}
    `);

    const total = Number(totalResult[0].count);

    // Transform data to match expected format
    const historiesWithUser = allUserRewardMaps.map((userRewardMap) => ({
      id: userRewardMap.id,
      userId: userRewardMap.userId,
      rewardId: userRewardMap.rewardId,
      status: userRewardMap.status,
      note: userRewardMap.note,
      createdAt: userRewardMap.createdAt,
      updatedAt: userRewardMap.updatedAt,
      reward: userRewardMap.reward_id
        ? {
            id: userRewardMap.reward_id,
            name: userRewardMap.reward_name,
            value: userRewardMap.reward_value,
          }
        : null,
      user: userRewardMap.user_id
        ? {
            id: userRewardMap.user_id,
            userId: userRewardMap.user_userId,
            userName: userRewardMap.user_userName,
            stars: userRewardMap.user_stars,
            branch: userRewardMap.user_branch,
          }
        : null,
      userStarHistory: userRewardMap.userStarHistory_id
        ? {
            id: userRewardMap.userStarHistory_id,
            oldStars: userRewardMap.userStarHistory_oldStars,
            newStars: userRewardMap.userStarHistory_newStars,
            createdAt: userRewardMap.userStarHistory_createdAt,
          }
        : null,
    }));

    console.log("histories", historiesWithUser);
    console.log("total", total);

    return NextResponse.json({
      histories: historiesWithUser,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[REWARD_EXCHANGE_HISTORY_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
