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
        userFilter = `AND urm.userId = ${user[0].userId}`;
        userJoin = `
          LEFT JOIN User u ON urm.userId = u.userId AND u.branch = '${branch}'
        `;
      }
    } else {
      userJoin = `
        LEFT JOIN User u ON urm.userId = u.userId AND u.branch = '${branch}'
      `;
    }

    console.log("userFilter------", userFilter);
    console.log("userJoin------", userJoin);

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
        urm.type,
        pr.name as rewardName,
        pr.value as rewardValue,
        pr.starsValue as rewardStars,
        er.name as eventRewardName,
        pc.name as eventPromotionCodeName,
        pc.code as eventPromotionCodeCode,
        pc.rewardType as eventPromotionCodeType,
        pc.rewardValue as eventPromotionCodeValue,
        u.userId as userUserId,
        u.userName,
        u.stars as userStars,
        u.branch as userBranch
      FROM UserRewardMap urm
      LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id AND urm.type = 'STARS'
      LEFT JOIN EventReward er ON urm.rewardId = er.id AND urm.type = 'EVENT'
      LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id AND urm.type = 'EVENT'
      ${userJoin}
      WHERE urm.status = 'INITIAL'
        AND urm.branch = '${branch}'
        ${userFilter}
      ORDER BY urm.createdAt DESC
    `);

    // Get Fnet money for each user (from wallettb to get main and sub)
    const fnetDB = await getFnetDB();
    const userIds = [
      ...new Set(pendingRewards.map((r) => r.userUserId).filter(Boolean)),
    ];

    let fnetWallets = [];
    if (userIds.length > 0) {
      fnetWallets = await fnetDB.$queryRaw<any[]>`
        SELECT userid, main, sub 
        FROM wallettb 
        WHERE userid IN (${userIds.join(",")})
      `;
    }

    // Create a map for quick lookup
    const fnetMoneyMap = new Map();
    fnetWallets.forEach((wallet) => {
      const main = Number(wallet.main) || 0;
      const sub = Number(wallet.sub) || 0;
      const userId = Number(wallet.userid); // Convert to number for consistent key

      console.log(
        `[PENDING] Wallet for userId ${userId}: main=${main}, sub=${sub}`,
      );

      fnetMoneyMap.set(userId, {
        main,
        sub,
        total: main + sub,
      });
    });

    console.log(`[PENDING] Total wallets loaded: ${fnetWallets.length}`);

    // Get FnetHistory for pending rewards (to show before/after for EVENT rewards)
    const rewardIds = pendingRewards.map((r) => Number(r.id)).filter(Boolean);
    let fnetHistories = [];
    if (rewardIds.length > 0) {
      fnetHistories = await db.$queryRaw<any[]>`
        SELECT targetId, oldMainMoney, newMainMoney, oldSubMoney, newSubMoney, type
        FROM FnetHistory
        WHERE targetId IN (${rewardIds.join(",")})
          AND branch = ${branch}
          AND type IN ('REWARD', 'VOUCHER')
      `;
    }

    // Create a map for FnetHistory lookup by targetId (UserRewardMap.id)
    const fnetHistoryMap = new Map();
    fnetHistories.forEach((record) => {
      const targetId = Number(record.targetId);
      const historyData = {
        oldMain: Number(record.oldMainMoney) || 0,
        newMain: Number(record.newMainMoney) || 0,
        oldSub: Number(record.oldSubMoney) || 0,
        newSub: Number(record.newSubMoney) || 0,
        type: record.type,
      };
      fnetHistoryMap.set(targetId, historyData);
      console.log(
        `[PENDING] FnetHistory for targetId ${targetId}:`,
        JSON.stringify(historyData),
      );
    });

    console.log(
      `[PENDING] Total FnetHistory records loaded: ${fnetHistories.length}`,
    );

    // Transform data to simplified format
    const rewardsWithUser = pendingRewards.map((reward) => {
      // Số sao hiện tại = số sao trong DB (đã trừ rồi khi tạo request)
      const currentStars = reward.userStars;
      // Số sao sau đổi = số sao hiện tại - rewardValue (sẽ trừ thêm khi approve)
      const afterExchangeStars = currentStars - (reward.rewardStars || 0);

      const userId = Number(reward.userUserId); // Convert to number
      const walletInfo = fnetMoneyMap.get(userId) || {
        main: 0,
        sub: 0,
        total: 0,
      };
      const rewardId = Number(reward.id);
      const historyInfo = fnetHistoryMap.get(rewardId);

      console.log(
        `[PENDING] Reward ${rewardId} for userId ${userId}: walletInfo=`,
        walletInfo,
        "historyInfo=",
        historyInfo,
      );

      const baseData = {
        id: reward.id,
        promotionCodeId: reward.promotionCodeId,
        duration: reward.duration,
        isUsed: reward.isUsed,
        status: reward.status,
        branch: reward.branch,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt,
        note: reward.note,
        type: reward.type,
        user: {
          userId: reward.userUserId,
          userName: reward.userName,
          stars: currentStars,
          afterExchangeStars: afterExchangeStars,
          branch: reward.userBranch,
          fnetMoney: walletInfo.total, // Backward compatibility
          // Nếu có FnetHistory thì dùng oldMain/oldSub, không thì dùng wallet hiện tại
          fnetMain: historyInfo ? historyInfo.oldMain : walletInfo.main,
          fnetSub: historyInfo ? historyInfo.oldSub : walletInfo.sub,
          // Nếu có FnetHistory thì dùng newMain/newSub để hiển thị "Sau đổi"
          fnetMainAfter: historyInfo ? historyInfo.newMain : undefined,
          fnetSubAfter: historyInfo ? historyInfo.newSub : undefined,
        },
      };

      // Thêm thông tin reward dựa trên type
      if (reward.type === "EVENT") {
        return {
          ...baseData,
          reward: {
            id: reward.rewardId,
            name:
              reward.eventPromotionCodeName ||
              reward.eventRewardName ||
              "Phần thưởng Event",
            type: reward.eventPromotionCodeType,
            code: reward.eventPromotionCodeCode,
            value: reward.eventPromotionCodeValue || null,
          },
        };
      } else {
        return {
          ...baseData,
          reward: {
            id: reward.rewardId,
            name: reward.rewardName,
            value: reward.rewardValue,
            stars: reward.rewardStars,
          },
        };
      }
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
