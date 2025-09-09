import { NextResponse } from "next/server";
import { db, getFnetDB } from "@/lib/db";
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
        urm.id,
        urm.userId,
        urm.rewardId,
        urm.promotionCodeId,
        urm.duration,
        urm.isUsed,
        urm.status,
        urm.branch,
        urm.createdAt,
        urm.updatedAt,
        urm.note,
        pr.name as rewardName,
        pr.value as rewardValue,
        pr.starsValue as rewardStars,
        u.userId as userUserId,
        u.userName,
        u.stars as userStars,
        u.branch as userBranch
      FROM UserRewardMap urm
      LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id
      ${userJoin}
      WHERE urm.status = 'INITIAL'
        AND urm.branch = '${branch}'
        ${userFilter}
      ORDER BY urm.createdAt DESC
    `);

    // Get Fnet money for each user
    const fnetDB = await getFnetDB();
    const userIds = [...new Set(pendingRewards.map(r => r.userUserId).filter(Boolean))];
    
    let fnetUsers = [];
    if (userIds.length > 0) {
      fnetUsers = await fnetDB.$queryRaw<any[]>`
        SELECT UserId, RemainMoney 
        FROM usertb 
        WHERE UserId IN (${userIds.join(',')})
      `;
    }

    // Create a map for quick lookup
    const fnetMoneyMap = new Map();
    fnetUsers.forEach(user => {
      fnetMoneyMap.set(user.UserId, user.RemainMoney);
    });

    // Transform data to simplified format
    const rewardsWithUser = pendingRewards.map((reward) => {
      // Số sao hiện tại = số sao trong DB (đã trừ rồi khi tạo request)
      const currentStars = reward.userStars;
      // Số sao sau đổi = số sao hiện tại - rewardValue (sẽ trừ thêm khi approve)
      const afterExchangeStars = currentStars - reward.rewardStars;
      
      return {
        id: reward.id,
        promotionCodeId: reward.promotionCodeId,
        duration: reward.duration,
        isUsed: reward.isUsed,
        status: reward.status,
        branch: reward.branch,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt,
        note: reward.note,
        reward: {
          id: reward.rewardId,
          name: reward.rewardName,
          value: reward.rewardValue,
          stars: reward.rewardStars,
        },
        user: {
          userId: reward.userUserId,
          userName: reward.userName,
          stars: currentStars, // Hiển thị số sao hiện tại (đã cộng thêm rewardValue)
          afterExchangeStars: afterExchangeStars, // Thêm số sao sau đổi
          branch: reward.userBranch,
          fnetMoney: fnetMoneyMap.get(reward.userUserId) || 0,
        },
      };
    });

    return NextResponse.json(rewardsWithUser);
  } catch (error) {
    console.error("[REWARD_EXCHANGE_PENDING_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
