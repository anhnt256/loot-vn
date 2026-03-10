import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/server-utils";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    // Lấy userId từ JWT token
    const currentUser = await getCurrentUser(cookieStore);
    if (!currentUser || !currentUser.userId) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 },
      );
    }

    const userId = currentUser.userId;

    // Query để lấy các PromotionCode của user thông qua UserRewardMap trong tháng hiện tại
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    console.log("Debug month filter:");
    console.log("Current date:", now);
    console.log("Start of month:", startOfMonth);
    console.log("End of month:", endOfMonth);
    console.log("Month:", now.getMonth() + 1, "Year:", now.getFullYear());

    // Query để lấy các PromotionCode từ rewardsReceived trong EventParticipant
    const eventParticipant = await db.$queryRaw<any[]>`
      SELECT rewardsReceived 
      FROM EventParticipant 
      WHERE userId = ${userId} AND branch = ${branch}
      ORDER BY registeredAt DESC
      LIMIT 1
    `;

    console.log("EventParticipant found:", eventParticipant.length);

    const promotionCodes = [];

    // Lấy PromotionCode từ EventParticipant.rewardsReceived (bao gồm cả EVENT và BATTLE_PASS)
    if (eventParticipant.length > 0 && eventParticipant[0].rewardsReceived) {
      try {
        const rewardsReceived = JSON.parse(eventParticipant[0].rewardsReceived);
        console.log("RewardsReceived:", rewardsReceived);

        // Lấy PromotionCode details cho từng reward (bao gồm EVENT và BATTLE_PASS)
        for (const reward of rewardsReceived) {
          if (reward.promotionCodeId) {
            // Kiểm tra UserRewardMap để lấy status
            const userRewardMap = await db.$queryRaw<any[]>`
              SELECT status FROM UserRewardMap
              WHERE promotionCodeId = ${reward.promotionCodeId}
                AND userId = ${userId}
                AND branch = ${branch}
              ORDER BY createdAt DESC
              LIMIT 1
            `;

            // HIỂN THỊ TẤT CẢ:
            // - Chưa redeem (không có UserRewardMap)
            // - INITIAL (đang chờ duyệt)
            // - REJECT (bị từ chối - cho phép đổi thưởng lại)
            // - APPROVE (đã duyệt - đã sử dụng)

            const status =
              userRewardMap.length > 0 ? userRewardMap[0].status : null;
            const source = reward.source || "EVENT"; // BATTLE_PASS hoặc EVENT
            console.log(
              `Showing promotionCodeId ${reward.promotionCodeId} - status: ${status || "not redeemed"} - source: ${source}`,
            );

            const promotionCode = await db.$queryRaw<any[]>`
              SELECT * FROM PromotionCode WHERE id = ${reward.promotionCodeId}
            `;

            if (promotionCode.length > 0) {
              const pc = promotionCode[0];
              promotionCodes.push({
                id: Number(pc.id),
                name: pc.name || "",
                code: pc.code || "",
                value: pc.value ? Number(pc.value) : null,
                branch: pc.branch || "",
                isUsed: Boolean(pc.isUsed),
                status: status, // Thêm status từ UserRewardMap (null, INITIAL, APPROVE, REJECT)
                eventId: pc.eventId || "",
                rewardType: pc.rewardType || "",
                rewardValue: pc.rewardValue ? Number(pc.rewardValue) : null,
                expirationDate: pc.expirationDate
                  ? pc.expirationDate instanceof Date
                    ? pc.expirationDate.toISOString()
                    : pc.expirationDate
                  : null,
                createdAt: pc.createdAt
                  ? pc.createdAt instanceof Date
                    ? pc.createdAt.toISOString()
                    : pc.createdAt
                  : null,
                updatedAt: pc.updatedAt
                  ? pc.updatedAt instanceof Date
                    ? pc.updatedAt.toISOString()
                    : pc.updatedAt
                  : null,
                source: source, // BATTLE_PASS hoặc EVENT
              });
            }
          }
        }
      } catch (parseError) {
        console.error("Error parsing rewardsReceived:", parseError);
      }
    }

    // Transform data để match với frontend
    const transformedPromotionCodes = promotionCodes.map((code: any) => ({
      id: Number(code.id),
      name: code.name || "",
      code: code.code || "",
      value: code.value ? Number(code.value) : null,
      branch: code.branch || "",
      isUsed: Boolean(code.isUsed),
      status: code.status || null, // QUAN TRỌNG: Thêm status
      eventId: code.eventId || "",
      rewardType: code.rewardType || "",
      rewardValue: code.rewardValue ? Number(code.rewardValue) : null,
      expirationDate: code.expirationDate
        ? code.expirationDate instanceof Date
          ? code.expirationDate.toISOString()
          : code.expirationDate
        : null,
      createdAt: code.createdAt
        ? code.createdAt instanceof Date
          ? code.createdAt.toISOString()
          : code.createdAt
        : null,
      updatedAt: code.updatedAt
        ? code.updatedAt instanceof Date
          ? code.updatedAt.toISOString()
          : code.updatedAt
        : null,
      source: code.source || "EVENT", // BATTLE_PASS hoặc EVENT
    }));

    console.log(
      "Transformed promotion codes:",
      transformedPromotionCodes.length,
    );

    return NextResponse.json({
      success: true,
      promotionCodes: transformedPromotionCodes,
      total: transformedPromotionCodes.length,
    });
  } catch (error) {
    console.error("Error fetching user promotion codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
