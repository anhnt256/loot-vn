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
    const userId = searchParams.get("userId");

    if (!branch) {
      return NextResponse.json(
        { error: "Branch is required" },
        { status: 400 },
      );
    }

    let userFilter = "";
    let userJoin = "";

    // Nếu có userId, lọc theo user cụ thể
    if (userId) {
      const user = await db.$queryRaw<any[]>`
        SELECT * FROM User 
        WHERE userId = ${parseInt(userId, 10)} 
        AND branch = ${branch}
        LIMIT 1
      `;

      if (user.length > 0) {
        userFilter = `AND urm.userId = ${user[0].id}`;
        userJoin = `
          LEFT JOIN User u ON urm.userId = u.id AND u.branch = '${branch}'
        `;
      }
    } else {
      userJoin = `
        LEFT JOIN User u ON urm.userId = u.id AND u.branch = '${branch}'
      `;
    }

    const pendingRewards = await db.$queryRawUnsafe<any[]>(`
      SELECT 
        urm.*,
        r.id as reward_id,
        r.name as reward_name,
        r.value as reward_value,
        r.stars as reward_stars,
        pc.id as promotionCode_id,
        pc.code as promotionCode_code,
        pc.name as promotionCode_name,
        pc.value as promotionCode_value,
        u.id as user_id,
        u.userId as user_userId,
        u.userName as user_userName,
        u.stars as user_stars,
        u.branch as user_branch
      FROM UserRewardMap urm
      LEFT JOIN Reward r ON urm.rewardId = r.id
      LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id
      ${userJoin}
      WHERE urm.status = 'INITIAL'
        AND urm.branch = '${branch}'
        ${userFilter}
      ORDER BY urm.createdAt DESC
    `);

    // Transform data to match expected format
    const rewardsWithUser = pendingRewards.map((reward) => ({
      ...reward,
      reward: reward.reward_id ? {
        id: reward.reward_id,
        name: reward.reward_name,
        value: reward.reward_value,
        stars: reward.reward_stars,
      } : null,
      promotionCode: reward.promotionCode_id ? {
        id: reward.promotionCode_id,
        code: reward.promotionCode_code,
        name: reward.promotionCode_name,
        value: reward.promotionCode_value,
      } : null,
      user: reward.user_id ? {
        id: reward.user_id,
        userId: reward.user_userId,
        userName: reward.user_userName,
        stars: reward.user_stars,
        branch: reward.user_branch,
      } : null,
    }));

    return NextResponse.json(rewardsWithUser);
  } catch (error) {
    console.error("[REWARD_EXCHANGE_PENDING_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
