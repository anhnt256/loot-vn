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

    let statusFilter = "AND urm.status != 'INITIAL'"; // Chỉ lấy records không phải chờ duyệt
    if (status && status !== "ALL") {
      statusFilter = `AND urm.status = '${status}'`;
    }

    // Get UserRewardMap records with pagination
    const allUserRewardMaps = await db.$queryRawUnsafe<any[]>(`
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
        pc.code as eventPromotionCode,
        pc.name as eventPromotionCodeName,
        pc.rewardType as eventPromotionCodeType,
        pc.rewardValue as eventPromotionCodeValue,
        er.name as eventRewardName,
        u.userId as userUserId,
        u.userName,
        u.stars as userStars,
        u.branch as userBranch,
        ush.id as userStarHistory_id,
        ush.oldStars as userStarHistory_oldStars,
        ush.newStars as userStarHistory_newStars,
        ush.createdAt as userStarHistory_createdAt
      FROM UserRewardMap urm
      LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id AND urm.type = 'STARS'
      LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id AND urm.type = 'EVENT'
      LEFT JOIN EventReward er ON urm.rewardId = er.id AND urm.type = 'EVENT'
      LEFT JOIN User u ON urm.userId = u.userId AND u.branch = '${branch}'
      LEFT JOIN (
        SELECT ush1.*
        FROM UserStarHistory ush1
        INNER JOIN (
          SELECT targetId, MAX(createdAt) as maxCreatedAt
          FROM UserStarHistory
          WHERE branch = '${branch}' AND type = 'REWARD'
          GROUP BY targetId
        ) ush2 ON ush1.targetId = ush2.targetId AND ush1.createdAt = ush2.maxCreatedAt
        WHERE ush1.branch = '${branch}' AND ush1.type = 'REWARD'
      ) ush ON ush.targetId = urm.id
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

    // Get Fnet money from FnetHistory for each reward exchange
    const targetIds = allUserRewardMaps.map((r) => r.id).filter(Boolean);
    let fnetHistoryRecords = [];

    if (targetIds.length > 0) {
      fnetHistoryRecords = await db.$queryRawUnsafe<any[]>(`
        SELECT 
          fh.userId,
          fh.oldMainMoney,
          fh.newMainMoney,
          fh.oldSubMoney,
          fh.newSubMoney,
          fh.targetId,
          fh.type,
          fh.createdAt
        FROM FnetHistory fh
        WHERE fh.targetId IN (${targetIds.join(",")})
          AND fh.branch = '${branch}'
          AND fh.type IN ('REWARD', 'VOUCHER')
      `);
    }

    // Create a map for quick lookup - map by targetId (UserRewardMap.id)
    const fnetMoneyMap = new Map();
    fnetHistoryRecords.forEach((record) => {
      const oldMain = Number(record.oldMainMoney) || 0;
      const oldSub = Number(record.oldSubMoney) || 0;
      const newMain = Number(record.newMainMoney) || 0;
      const newSub = Number(record.newSubMoney) || 0;
      const targetId = Number(record.targetId); // Convert to number

      console.log(
        `[HISTORY] FnetHistory for targetId ${targetId}: oldMain=${oldMain}, newMain=${newMain}, oldSub=${oldSub}, newSub=${newSub}`,
      );

      fnetMoneyMap.set(targetId, {
        oldMain,
        oldSub,
        oldTotal: oldMain + oldSub,
        newMain,
        newSub,
        newTotal: newMain + newSub,
      });
    });

    console.log(
      `[HISTORY] Total FnetHistory records: ${fnetHistoryRecords.length}`,
    );

    // Transform data to match expected format
    const historiesWithUser = allUserRewardMaps.map((userRewardMap) => {
      const rewardMapId = Number(userRewardMap.id); // Convert to number
      const walletInfo = fnetMoneyMap.get(rewardMapId) || {
        oldMain: 0,
        oldSub: 0,
        oldTotal: 0,
        newMain: 0,
        newSub: 0,
        newTotal: 0,
      };

      const baseData = {
        id: userRewardMap.id,
        promotionCodeId: userRewardMap.promotionCodeId,
        duration: userRewardMap.duration,
        isUsed: userRewardMap.isUsed,
        status: userRewardMap.status,
        branch: userRewardMap.branch,
        createdAt: userRewardMap.createdAt,
        updatedAt: userRewardMap.updatedAt,
        note: userRewardMap.note,
        type: userRewardMap.type,
        user: {
          userId: userRewardMap.userUserId,
          userName: userRewardMap.userName,
          stars:
            userRewardMap.userStarHistory_newStars ||
            userRewardMap.userStars ||
            0,
          branch: userRewardMap.userBranch,
          fnetMoney: walletInfo.oldTotal, // Backward compatibility
          fnetMain: walletInfo.oldMain,
          fnetSub: walletInfo.oldSub,
          fnetMainAfter: walletInfo.newMain,
          fnetSubAfter: walletInfo.newSub,
        },
      };

      // Thêm thông tin reward dựa trên type
      if (userRewardMap.type === "EVENT") {
        return {
          ...baseData,
          reward: {
            id: userRewardMap.rewardId,
            name:
              userRewardMap.eventPromotionCodeName ||
              userRewardMap.eventRewardName ||
              "Phần thưởng Event",
            type: userRewardMap.eventPromotionCodeType,
            code: userRewardMap.eventPromotionCode,
            value: userRewardMap.eventPromotionCodeValue || null,
          },
        };
      } else {
        return {
          ...baseData,
          reward: {
            id: userRewardMap.rewardId,
            name: userRewardMap.rewardName,
            value: userRewardMap.rewardValue,
            stars: userRewardMap.rewardStars,
          },
        };
      }
    });

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
