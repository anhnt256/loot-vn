import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Tìm user theo userId và branch
    const user = await db.$queryRaw<any[]>`
      SELECT * FROM User 
      WHERE userId = ${parseInt(userId, 10)} 
      AND branch = ${branch}
      LIMIT 1
    `;

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [rewards, total] = await Promise.all([
      db.$queryRaw<any[]>`
        SELECT 
          urm.*,
          r.id as reward_id,
          r.name as reward_name,
          r.value as reward_value,
          r.stars as reward_stars,
          pc.id as promotionCode_id,
          pc.code as promotionCode_code,
          pc.name as promotionCode_name,
          pc.value as promotionCode_value
        FROM UserRewardMap urm
        LEFT JOIN Reward r ON urm.rewardId = r.id
        LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id
        WHERE urm.userId = ${user[0].id}
          AND urm.branch = ${branch}
        ORDER BY urm.createdAt DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      db.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM UserRewardMap 
        WHERE userId = ${user[0].id}
          AND branch = ${branch}
      `,
    ]);

    return NextResponse.json({
      rewards: rewards,
      pagination: {
        page,
        limit,
        total: Number(total[0].count),
        totalPages: Math.ceil(Number(total[0].count) / limit),
      },
    });
  } catch (error) {
    console.error("[REWARD_EXCHANGE_USER_HISTORY_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
