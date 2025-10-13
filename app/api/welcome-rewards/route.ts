import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { getCurrentUser } from "@/lib/server-utils";

/**
 * Validate user có ID hoặc Phone hợp lệ và unique
 * - ID hoặc Phone phải có dữ liệu (không rỗng)
 * - Không được trùng với user khác
 */
async function validateUserIdentity(
  userId: number,
  fnetDB: any,
): Promise<{
  isValid: boolean;
  errorMessage?: string;
  id?: string;
  phone?: string;
}> {
  try {
    // Lấy thông tin ID và Phone của user
    const userInfo = (await fnetDB.$queryRawUnsafe(`
      SELECT UserId, ID, Phone
      FROM usertb
      WHERE UserId = ${userId}
      LIMIT 1
    `)) as any[];

    if (userInfo.length === 0) {
      return { isValid: false, errorMessage: "Không tìm thấy thông tin user" };
    }

    const user = userInfo[0];
    const id = user.ID?.trim() || "";
    const phone = user.Phone?.trim() || "";

    console.log(`User ${userId} - ID: "${id}", Phone: "${phone}"`);

    // Check: Phải có ít nhất ID hoặc Phone
    if (!id && !phone) {
      return {
        isValid: false,
        errorMessage:
          "Vui lòng cập nhật CMND/CCCD hoặc Số điện thoại để nhận phần thưởng",
      };
    }

    // Check ID trùng với user khác (nếu có ID)
    if (id) {
      const duplicateIdUsers = (await fnetDB.$queryRawUnsafe(`
        SELECT UserId, ID
        FROM usertb
        WHERE ID = '${id}'
          AND ID != ''
          AND UserId != ${userId}
        LIMIT 1
      `)) as any[];

      if (duplicateIdUsers.length > 0) {
        console.log(
          `User ${userId} - Duplicate ID found: ${duplicateIdUsers[0].UserId}`,
        );
        return {
          isValid: false,
          errorMessage: "CMND/CCCD đã được sử dụng bởi tài khoản khác",
        };
      }
    }

    // Check Phone trùng với user khác (nếu có Phone)
    if (phone) {
      const duplicatePhoneUsers = (await fnetDB.$queryRawUnsafe(`
        SELECT UserId, Phone
        FROM usertb
        WHERE Phone = '${phone}'
          AND Phone != ''
          AND UserId != ${userId}
        LIMIT 1
      `)) as any[];

      if (duplicatePhoneUsers.length > 0) {
        console.log(
          `User ${userId} - Duplicate Phone found: ${duplicatePhoneUsers[0].UserId}`,
        );
        return {
          isValid: false,
          errorMessage: "Số điện thoại đã được sử dụng bởi tài khoản khác",
        };
      }
    }

    return { isValid: true, id, phone };
  } catch (error) {
    console.error("Error validating user identity:", error);
    return { isValid: false, errorMessage: "Lỗi khi kiểm tra thông tin user" };
  }
}

/**
 * Check xem user có phải user cũ quay trở lại không
 * Logic: Lấy 2 NGÀY khác nhau gần nhất từ systemlogtb (không phải 2 records)
 * - Nếu 2 ngày cách nhau >= 30 ngày -> user cũ quay trở lại
 * - Nếu < 30 ngày -> user thường xuyên
 */
async function checkIsReturnedUser(
  userId: number,
  fnetDB: any,
): Promise<{ isReturned: boolean; daysSinceLastSession: number | null }> {
  try {
    // Lấy 2 NGÀY DISTINCT gần nhất (status = 3 là đã logout/hoàn thành)
    // GROUP BY EnterDate để lấy các ngày khác nhau
    const recentDates = (await fnetDB.$queryRawUnsafe(`
      SELECT 
        EnterDate,
        COUNT(*) as sessionsOnThisDay
      FROM systemlogtb
      WHERE UserId = ${userId}
        AND status = 3
      GROUP BY EnterDate
      ORDER BY EnterDate DESC
      LIMIT 2
    `)) as any[];

    console.log(
      "Recent distinct dates for user:",
      JSON.stringify(recentDates, null, 2),
    );

    if (recentDates.length < 2) {
      // Chưa đủ 2 ngày khác nhau để so sánh
      console.log(
        `User ${userId} - Not enough distinct login dates (only ${recentDates.length} date(s))`,
      );
      return { isReturned: false, daysSinceLastSession: null };
    }

    const latestDate = new Date(recentDates[0].EnterDate);
    const previousDate = new Date(recentDates[1].EnterDate);
    const daysDiff = Math.floor(
      (latestDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    console.log(
      `User ${userId} - Latest login date: ${recentDates[0].EnterDate}, Previous login date: ${recentDates[1].EnterDate}, Days diff: ${daysDiff}`,
    );
    console.log(
      `User ${userId} - Sessions on latest date: ${recentDates[0].sessionsOnThisDay}, Sessions on previous date: ${recentDates[1].sessionsOnThisDay}`,
    );

    return {
      isReturned: daysDiff >= 30,
      daysSinceLastSession: daysDiff,
    };
  } catch (error) {
    console.error("Error checking returned user:", error);
    return { isReturned: false, daysSinceLastSession: null };
  }
}

/**
 * GET /api/welcome-rewards
 *
 * Trả về thông tin welcome rewards và payment info của user
 *
 * Logic tính toán:
 * - Lấy tất cả payments trong 14 ngày gần nhất (tính từ hôm nay)
 * - Check xem user có phải user cũ quay trở lại không (dựa vào 2 sessions gần nhất cách nhau >= 30 ngày)
 *
 * Response userPaymentInfo bao gồm:
 * - totalDeposit: Tổng tiền nạp trong 14 ngày gần nhất
 * - isWithin14Days: Luôn true (vì tính trong 14 ngày gần nhất)
 * - isReturnedUser: User cũ quay trở lại hay không
 */
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

    // Lấy userId từ JWT token thay vì cookie
    const currentUser = await getCurrentUser(cookieStore);
    if (!currentUser || !currentUser.userId) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 },
      );
    }

    const currentTime = getCurrentTimeVNDB();
    const userIdNum = currentUser.userId;

    // Get fnetDB instance để check payment data
    const fnetDB = await getFnetDB();

    // Validate user identity (ID hoặc Phone phải có và unique)
    const identityValidation = await validateUserIdentity(userIdNum, fnetDB);
    if (!identityValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: identityValidation.errorMessage,
          canClaim: false,
          requiresIdentityUpdate: true,
        },
        { status: 400 },
      );
    }

    console.log(
      `User ${userIdNum} - Identity validated: ID="${identityValidation.id}", Phone="${identityValidation.phone}"`,
    );

    // Query để lấy event NEW_USER_WELCOME đang active và còn hiệu lực
    const activeEvent = await db.$queryRaw<any[]>`
      SELECT 
        e.id as eventId,
        e.name as eventName,
        e.description as eventDescription,
        e.startDate,
        e.endDate,
        e.branch
      FROM Event e
      WHERE e.type = 'NEW_USER_WELCOME'
        AND e.status IN ('ACTIVE', 'DRAFT')
        AND e.branch = ${branch}
        AND e.isActive = true
        AND e.startDate <= ${currentTime}
        AND e.endDate >= ${currentTime}
      ORDER BY e.createdAt DESC
      LIMIT 1
    `;

    if (activeEvent.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active welcome event found",
        event: null,
        rewards: [],
      });
    }

    const event = activeEvent[0];

    // Lấy thông tin rewardsReceived của user
    const eventParticipant = await db.$queryRaw<any[]>`
      SELECT rewardsReceived
      FROM EventParticipant
      WHERE eventId = ${event.eventId}
        AND userId = ${userIdNum}
        AND branch = ${branch}
      LIMIT 1
    `;

    const claimedRewardIds = new Set();
    const rejectedPromotionCodeIds = new Set();

    if (eventParticipant.length > 0 && eventParticipant[0].rewardsReceived) {
      try {
        const rewardsReceived = JSON.parse(eventParticipant[0].rewardsReceived);

        // Check status của từng reward trong UserRewardMap
        for (const reward of rewardsReceived) {
          if (reward.promotionCodeId) {
            const userRewardMap = await db.$queryRaw<any[]>`
              SELECT status FROM UserRewardMap
              WHERE promotionCodeId = ${reward.promotionCodeId}
                AND userId = ${userIdNum}
                AND branch = ${branch}
              ORDER BY createdAt DESC
              LIMIT 1
            `;

            if (
              userRewardMap.length > 0 &&
              userRewardMap[0].status === "REJECT"
            ) {
              // Nếu bị reject, cho phép claim lại
              rejectedPromotionCodeIds.add(reward.promotionCodeId);
            } else {
              // Đã claim và chưa bị reject
              claimedRewardIds.add(reward.id);
            }
          } else {
            // Đã claim nhưng chưa có promotionCodeId (lỗi?)
            claimedRewardIds.add(reward.id);
          }
        }
      } catch (e) {
        console.error("Error parsing rewardsReceived:", e);
      }
    }

    console.log("Claimed reward IDs:", Array.from(claimedRewardIds));
    console.log(
      "Rejected promotion code IDs:",
      Array.from(rejectedPromotionCodeIds),
    );

    // Query để lấy các rewards của event này
    const eventRewards = await db.$queryRaw<any[]>`
      SELECT 
        er.id,
        er.name,
        er.description,
        er.rewardType,
        er.rewardConfig,
        er.maxQuantity,
        er.used,
        er.maxPerUser,
        er.validFrom,
        er.validTo,
        er.priority,
        er.isActive
      FROM EventReward er
      WHERE er.eventId = ${event.eventId}
        AND er.isActive = true
      ORDER BY er.priority ASC, er.createdAt ASC
    `;

    // Check xem user có phải user cũ quay trở lại không
    const returnedUserInfo = await checkIsReturnedUser(userIdNum, fnetDB);

    // Check điều kiện nạp tiền trong 14 ngày tính từ hôm nay
    let userPaymentData = null;
    try {
      // Tính 14 ngày từ hôm nay trở về trước
      const now = new Date();
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Format dates cho query
      const startDate =
        fourteenDaysAgo.toISOString().split("T")[0] + " 00:00:00";
      const endDate = now.toISOString().split("T")[0] + " 23:59:59";

      console.log("=== WELCOME REWARDS PAYMENT CHECK ===");
      console.log("UserID:", userIdNum);
      console.log("Start Date (14 days ago):", startDate);
      console.log("End Date (today):", endDate);
      console.log("Is Returned User:", returnedUserInfo.isReturned);
      console.log(
        "Days Since Last Session:",
        returnedUserInfo.daysSinceLastSession,
      );

      // Debug: Check all payment records first
      const allPayments = (await fnetDB.$queryRawUnsafe(`
        SELECT 
          VoucherId,
          UserId,
          ServeDate,
          ServeTime,
          (ServeDate + INTERVAL ServeTime HOUR_SECOND) as fullDateTime,
          AutoAmount,
          Note,
          PaymentType
        FROM paymenttb
        WHERE UserId = ${userIdNum}
          AND PaymentType = 4
        ORDER BY ServeDate DESC, ServeTime DESC
        LIMIT 20
      `)) as any[];
      console.log(
        "All Recent Payments for User:",
        JSON.stringify(allPayments, null, 2),
      );

      // Lấy tổng số tiền nạp trong 14 ngày gần nhất - dùng syntax giống user-calculator.ts
      const paymentResult = (await fnetDB.$queryRawUnsafe(`
        SELECT 
          COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS totalDeposit,
          COUNT(*) as recordCount
        FROM paymenttb
        WHERE PaymentType = 4
          AND UserId = ${userIdNum}
          AND Note = 'Thời gian phí'
          AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= '${startDate}'
          AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= '${endDate}'
      `)) as any[];

      console.log("Payment Result:", paymentResult);
      console.log("Total Deposit:", paymentResult[0]?.totalDeposit);
      console.log("Record Count:", paymentResult[0]?.recordCount);

      // Chỉ trả về thông tin cần thiết
      userPaymentData = {
        totalDeposit: parseFloat(
          paymentResult[0]?.totalDeposit?.toString() || "0",
        ),
        isWithin14Days: true, // Luôn là true vì đang tính trong vòng 14 ngày gần nhất
        isReturnedUser: returnedUserInfo.isReturned,
        daysSinceLastSession: returnedUserInfo.daysSinceLastSession,
      };
    } catch (error) {
      console.error("Error checking user payment data:", error);
      userPaymentData = {
        totalDeposit: 0,
        isWithin14Days: false,
        isReturnedUser: false,
        daysSinceLastSession: null,
      };
    }

    // Transform rewards data để match với frontend và check điều kiện
    const transformedRewards = eventRewards.map((reward: any) => {
      let rewardConfig: any = null;
      try {
        rewardConfig = JSON.parse(reward.rewardConfig);
      } catch (e) {
        console.error("Error parsing rewardConfig:", e);
        rewardConfig = {};
      }

      // Check điều kiện nạp tiền cho từng reward
      let canClaim = false;
      let depositRequired = 0;
      let alreadyClaimed = false;

      if (rewardConfig) {
        depositRequired = rewardConfig.depositAmount || 0;

        // Check xem reward đã được claim chưa
        alreadyClaimed = claimedRewardIds.has(Number(reward.id));

        // User có thể claim nếu:
        // 1. Trong vòng 14 ngày đầu sau khi tạo tài khoản
        // 2. Đã nạp đủ số tiền yêu cầu
        // 3. CHƯA claim HOẶC đã bị reject
        if (
          userPaymentData?.isWithin14Days &&
          userPaymentData.totalDeposit >= depositRequired &&
          !alreadyClaimed
        ) {
          canClaim = true;
        }
      }

      return {
        id: Number(reward.id),
        name: reward.name,
        description: reward.description || "",
        type: reward.rewardType,
        config: rewardConfig,
        maxQuantity: reward.maxQuantity ? Number(reward.maxQuantity) : null,
        used: Number(reward.used),
        maxPerUser: reward.maxPerUser ? Number(reward.maxPerUser) : null,
        validFrom: reward.validFrom,
        validTo: reward.validTo,
        priority: Number(reward.priority),
        isActive: Boolean(reward.isActive),
        canClaim: canClaim,
        depositRequired: depositRequired,
      };
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.eventId,
        name: event.eventName,
        description: event.eventDescription,
        startDate: event.startDate,
        endDate: event.endDate,
        branch: event.branch,
      },
      rewards: transformedRewards,
      userPaymentInfo: userPaymentData,
    });
  } catch (error) {
    console.error("Error fetching welcome rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
