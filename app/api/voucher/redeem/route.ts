import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { updateFnetMoney } from "@/lib/fnet-money-utils";
import {
  hasUserUsedEventReward,
  hasUserUsedNewUserWelcomeReward,
} from "@/lib/event-reward-utils";

export async function POST(request: NextRequest) {
  try {
    // Check both token and staffToken
    const token = request.cookies.get("token")?.value || request.cookies.get("staffToken")?.value;
    const branch = request.cookies.get("branch")?.value;

    console.log(`[Redeem Voucher] token exists: ${!!token}, branch: ${branch}`);

    if (!token || !branch) {
      console.log(
        `[Redeem Voucher] Missing auth - token: ${!!token}, branch: ${branch}`,
      );
      return NextResponse.json(
        {
          error: "Missing authentication or branch",
          hasToken: !!token,
          branch: branch,
        },
        { status: 401 },
      );
    }

    const payload = await verifyJWT(token);
    console.log(`[Redeem Voucher] JWT payload:`, payload);

    if (!payload || !payload.userId) {
      console.log(`[Redeem Voucher] Invalid token - payload:`, payload);
      return NextResponse.json(
        { error: "Invalid token", payload: payload },
        { status: 401 },
      );
    }

    const userId =
      typeof payload.userId === "string"
        ? parseInt(payload.userId)
        : payload.userId;
    console.log(
      `[Redeem Voucher] Authenticated - userId: ${userId}, branch: ${branch}`,
    );

    // Lấy thông tin từ request body
    const body = await request.json();
    const { promotionCodeId } = body;

    if (!promotionCodeId) {
      return NextResponse.json(
        { error: "Missing promotionCodeId" },
        { status: 400 },
      );
    }

    console.log(
      `[Redeem Voucher] userId: ${userId} (type: ${typeof userId}), branch: ${branch}, promotionCodeId: ${promotionCodeId}`,
    );

    // Sử dụng transaction với SELECT FOR UPDATE để lock row và đảm bảo chỉ 1 request xử lý tại 1 thời điểm
    return await db.$transaction(async (tx) => {
      // QUAN TRỌNG: Lock User record trước để đảm bảo mỗi user chỉ xử lý 1 voucher tại 1 thời điểm
      // Điều này ngăn chặn việc user click nhiều voucher khác nhau cùng lúc
      const userLock = await tx.$queryRaw<any[]>`
        SELECT id, userId, branch FROM User
        WHERE userId = ${userId} AND branch = ${branch}
        LIMIT 1
        FOR UPDATE
      `;

      if (!userLock || userLock.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Kiểm tra xem user có đang có yêu cầu đổi thưởng đang chờ duyệt không
      const pendingRewards = await tx.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM UserRewardMap
        WHERE userId = ${userId} AND branch = ${branch} AND status = 'INITIAL'
      `;

      if (pendingRewards[0]?.count > 0) {
        return NextResponse.json(
          {
            error:
              "Bạn đang có yêu cầu đổi thưởng đang chờ duyệt. Vui lòng đợi admin xử lý xong trước khi đổi thưởng tiếp.",
          },
          { status: 400 },
        );
      }

      // Kiểm tra PromotionCode có tồn tại và chưa sử dụng với SELECT FOR UPDATE để lock row
      const promotionCode = await tx.$queryRaw<any[]>`
        SELECT * FROM PromotionCode
        WHERE id = ${promotionCodeId} AND branch = ${branch} AND isUsed = false
        LIMIT 1
        FOR UPDATE
      `;

      if (!promotionCode || promotionCode.length === 0) {
        return NextResponse.json(
          { error: "Promotion code not found or already used" },
          { status: 404 },
        );
      }

      const promoCode = promotionCode[0];
      console.log(`[Redeem Voucher] PromotionCode:`, promoCode);

      // Kiểm tra xem promotion code có hết hạn không
      const now = new Date();
      const expirationDate = new Date(promoCode.expirationDate);
      if (expirationDate < now) {
        return NextResponse.json(
          { error: "Promotion code has expired" },
          { status: 400 },
        );
      }

      // **NEW: Xử lý voucher nạp tài khoản chính (MAIN_ACCOUNT_TOPUP)**
      if (promoCode.rewardType === "MAIN_ACCOUNT_TOPUP") {
        console.log(
          `[Redeem Voucher] Processing MAIN_ACCOUNT_TOPUP for userId: ${userId}`,
        );

        return await handleMainAccountTopup(
          promoCode,
          userId,
          branch,
          promotionCodeId,
          tx,
        );
      }

      // **NEW: Xử lý voucher FREE_HOURS (nạp tài khoản phụ)**
      if (promoCode.rewardType === "FREE_HOURS") {
        console.log(
          `[Redeem Voucher] Processing FREE_HOURS for userId: ${userId}`,
        );

        return await handleFreeHours(
          promoCode,
          userId,
          branch,
          promotionCodeId,
          tx,
        );
      }

      // Lấy eventRewardId từ promotionCode.eventId
      // Tìm EventReward tương ứng với eventId và rewardType
      // Ta cần tìm EventReward có rewardConfig chứa itemType tương ứng với rewardType
      const eventRewards = await tx.$queryRaw<any[]>`
        SELECT * FROM EventReward
        WHERE eventId = ${promoCode.eventId}
      `;

      let eventRewardId = null;

      // Tìm EventReward dựa trên rewardType
      // FREE_HOURS -> itemType: HOURS
      // FREE_DRINK -> itemType: DRINK
      // FREE_SNACK -> itemType: SNACK
      // FREE_FOOD -> itemType: FOOD
      const itemTypeMap: Record<string, string> = {
        FREE_HOURS: "HOURS",
        FREE_DRINK: "DRINK",
        FREE_SNACK: "SNACK",
        FREE_FOOD: "FOOD",
      };

      const targetItemType = itemTypeMap[promoCode.rewardType];

      if (targetItemType && eventRewards && eventRewards.length > 0) {
        for (const reward of eventRewards) {
          try {
            const rewardConfig = JSON.parse(reward.rewardConfig);
            if (rewardConfig.itemType === targetItemType) {
              eventRewardId = reward.id;
              console.log(
                `[Redeem Voucher] Found matching EventReward: ${eventRewardId} for itemType: ${targetItemType}`,
              );
              break;
            }
          } catch (e) {
            console.error(`[Redeem Voucher] Error parsing rewardConfig:`, e);
          }
        }
      }

      // Nếu không tìm thấy EventReward phù hợp, lấy cái đầu tiên
      if (!eventRewardId && eventRewards && eventRewards.length > 0) {
        eventRewardId = eventRewards[0].id;
        console.log(
          `[Redeem Voucher] Using first EventReward: ${eventRewardId}`,
        );
      }

      console.log(`[Redeem Voucher] Final EventRewardId: ${eventRewardId}`);

      // Check if user has already used this event reward
      if (eventRewardId) {
        // Special check for NEW_USER_WELCOME - only 1 record per user per branch
        if (promoCode.rewardType === "NEW_USER_WELCOME") {
          const hasUsedWelcome = await hasUserUsedNewUserWelcomeReward(
            userId,
            branch,
          );
          if (hasUsedWelcome) {
            return NextResponse.json(
              { error: "Bạn đã nhận phần thưởng chào mừng thành viên mới rồi" },
              { status: 400 },
            );
          }
        } else {
          // Normal check for other event rewards
          const hasUsed = await hasUserUsedEventReward(
            userId,
            eventRewardId,
            branch,
          );
          if (hasUsed) {
            return NextResponse.json(
              { error: "Bạn đã sử dụng phần thưởng này rồi" },
              { status: 400 },
            );
          }
        }
      }

      // Tạo UserRewardMap với type = EVENT
      const currentTime = getCurrentTimeVNDB();

      // Sử dụng raw query để tạo UserRewardMap
      const insertResult = await tx.$executeRaw`
        INSERT INTO UserRewardMap (userId, rewardId, promotionCodeId, duration, branch, isUsed, status, type, createdAt, updatedAt)
        VALUES (
          ${userId},
          ${eventRewardId},
          ${promotionCodeId},
          ${promoCode.rewardValue || null},
          ${branch},
          false,
          'INITIAL',
          'EVENT',
          NOW(),
          NOW()
        )
      `;

      console.log(
        `[Redeem Voucher] Created UserRewardMap - insertResult:`,
        insertResult,
      );

      // Lấy ID của record vừa tạo
      const userRewardMaps = await tx.$queryRaw<any[]>`
        SELECT * FROM UserRewardMap
        WHERE userId = ${userId} AND promotionCodeId = ${promotionCodeId}
        ORDER BY id DESC
        LIMIT 1
      `;

      const userRewardMap =
        userRewardMaps && userRewardMaps.length > 0 ? userRewardMaps[0] : null;
      console.log(`[Redeem Voucher] Created UserRewardMap:`, userRewardMap);

      // Cập nhật PromotionCode isUsed = true
      await tx.$executeRaw`
        UPDATE PromotionCode 
        SET isUsed = true, updatedAt = NOW()
        WHERE id = ${promotionCodeId}
      `;

      console.log(`[Redeem Voucher] Updated PromotionCode isUsed = true`);

      return NextResponse.json({
        success: true,
        message: "Voucher redeemed successfully",
        userRewardMap: userRewardMap,
      });
    });
  } catch (error) {
    console.error("[Redeem Voucher] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Handle MAIN_ACCOUNT_TOPUP voucher
 * Steps:
 * 1. Save FnetHistory with changes in mainMoney
 * 2. Create UserRewardMap with type = EVENT
 * 3. Call updateFnetMoney to add money to main account
 * 4. Mark PromotionCode as used
 */
async function handleMainAccountTopup(
  promoCode: any,
  userId: number,
  branch: string,
  promotionCodeId: number,
  tx: any,
) {
  try {
    console.log(
      `[MAIN_ACCOUNT_TOPUP] Starting for userId: ${userId}, amount: ${promoCode.rewardValue}`,
    );

    // Validate rewardValue
    if (!promoCode.rewardValue || promoCode.rewardValue <= 0) {
      return NextResponse.json(
        { error: "Invalid reward value" },
        { status: 400 },
      );
    }

    // Kiểm tra user có tồn tại trong Fnet không
    const fnetDB = await getFnetDB();
    const fnetUserCount = await fnetDB.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM usertb 
      WHERE UserId = ${userId}
    `;

    if (fnetUserCount[0].count === 0) {
      return NextResponse.json(
        { error: "User not found in Fnet database" },
        { status: 404 },
      );
    }

    if (fnetUserCount[0].count > 1) {
      return NextResponse.json(
        { error: "Multiple accounts found. Please contact admin." },
        { status: 400 },
      );
    }

    // Sử dụng transaction đã được truyền vào để đảm bảo atomic
    // 1. Lấy wallet hiện tại để save FnetHistory
    const walletResult = await fnetDB.$queryRaw<any[]>`
      SELECT main, sub FROM wallettb 
      WHERE userid = ${userId}
      LIMIT 1
    `;

    if (walletResult.length === 0) {
      throw new Error(`Wallet not found for userId: ${userId}`);
    }

    const oldMain = Number(walletResult[0].main) || 0;
    const oldSub = Number(walletResult[0].sub) || 0;
    const newMain = oldMain + promoCode.rewardValue;
    const newSub = oldSub; // Sub không đổi

    console.log(
      `[MAIN_ACCOUNT_TOPUP] Wallet snapshot - oldMain: ${oldMain}, newMain: ${newMain}, oldSub: ${oldSub}, newSub: ${newSub}`,
    );

    // 2. Create UserRewardMap với type = EVENT
    const insertResult = await tx.$executeRaw`
      INSERT INTO UserRewardMap (userId, rewardId, promotionCodeId, duration, branch, isUsed, status, type, createdAt, updatedAt)
      VALUES (
        ${userId},
        ${null},
        ${promotionCodeId},
        ${promoCode.rewardValue},
        ${branch},
        false,
        'INITIAL',
        'EVENT',
        NOW(),
        NOW()
      )
    `;

    console.log(
      `[MAIN_ACCOUNT_TOPUP] Created UserRewardMap - insertResult:`,
      insertResult,
    );

    // Get the inserted UserRewardMap ID
    const userRewardMapResults = await tx.$queryRaw<
      any[]
    >`SELECT LAST_INSERT_ID() as id`;
    const userRewardMapId = Number(userRewardMapResults[0]?.id);

    console.log(`[MAIN_ACCOUNT_TOPUP] UserRewardMap ID: ${userRewardMapId}`);

    // 3. Lưu FnetHistory với thay đổi ở mainMoney
    await tx.$executeRaw`
      INSERT INTO FnetHistory (userId, branch, oldSubMoney, newSubMoney, oldMainMoney, newMainMoney, moneyType, targetId, type, createdAt, updatedAt)
      VALUES (${userId}, ${branch}, ${oldSub}, ${newSub}, ${oldMain}, ${newMain}, 'MAIN', ${userRewardMapId}, 'VOUCHER', ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
    `;

    console.log(`[MAIN_ACCOUNT_TOPUP] Saved FnetHistory`);

    // 4. Mark PromotionCode as used
    await tx.$executeRaw`
      UPDATE PromotionCode 
      SET isUsed = true, updatedAt = NOW()
      WHERE id = ${promotionCodeId}
    `;

    console.log(`[MAIN_ACCOUNT_TOPUP] Marked PromotionCode as used`);

    return NextResponse.json({
      success: true,
      message: "Main account topup successful",
      amount: promoCode.rewardValue,
    });
  } catch (error) {
    console.error("[MAIN_ACCOUNT_TOPUP] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process main account topup",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Handle FREE_HOURS voucher
 * Steps:
 * 1. Get eventRewardId
 * 2. Save FnetHistory with changes in subMoney
 * 3. Create UserRewardMap with type = EVENT
 * 4. Mark PromotionCode as used
 * Note: Không gọi updateFnetMoney ở đây, chờ admin approve mới update wallet
 */
async function handleFreeHours(
  promoCode: any,
  userId: number,
  branch: string,
  promotionCodeId: number,
  tx: any,
) {
  try {
    console.log(
      `[FREE_HOURS] Starting for userId: ${userId}, amount: ${promoCode.rewardValue}`,
    );

    // Validate rewardValue
    if (!promoCode.rewardValue || promoCode.rewardValue <= 0) {
      return NextResponse.json(
        { error: "Invalid reward value" },
        { status: 400 },
      );
    }

    // Kiểm tra user có tồn tại trong Fnet không
    const fnetDB = await getFnetDB();
    const fnetUserCount = await fnetDB.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM usertb 
      WHERE UserId = ${userId}
    `;

    if (fnetUserCount[0].count === 0) {
      return NextResponse.json(
        { error: "User not found in Fnet database" },
        { status: 404 },
      );
    }

    if (fnetUserCount[0].count > 1) {
      return NextResponse.json(
        { error: "Multiple accounts found. Please contact admin." },
        { status: 400 },
      );
    }

    // Get eventRewardId
    const eventRewards = await tx.$queryRaw<any[]>`
      SELECT * FROM EventReward
      WHERE eventId = ${promoCode.eventId}
    `;

    let eventRewardId = null;
    for (const reward of eventRewards) {
      const config = reward.rewardConfig;
      if (config && typeof config === "object" && config.itemType === "HOURS") {
        eventRewardId = reward.id;
        break;
      }
    }

    if (!eventRewardId && eventRewards && eventRewards.length > 0) {
      eventRewardId = eventRewards[0].id;
    }

    console.log(`[FREE_HOURS] EventRewardId: ${eventRewardId}`);

    // Check if user has already used this event reward
    if (eventRewardId) {
      // Special check for NEW_USER_WELCOME - only 1 record per user per branch
      if (promoCode.rewardType === "NEW_USER_WELCOME") {
        const hasUsedWelcome = await hasUserUsedNewUserWelcomeReward(
          userId,
          branch,
        );
        if (hasUsedWelcome) {
          return NextResponse.json(
            { error: "Bạn đã nhận phần thưởng chào mừng thành viên mới rồi" },
            { status: 400 },
          );
        }
      } else {
        // Normal check for other event rewards
        const hasUsed = await hasUserUsedEventReward(
          userId,
          eventRewardId,
          branch,
        );
        if (hasUsed) {
          return NextResponse.json(
            { error: "Bạn đã sử dụng phần thưởng này rồi" },
            { status: 400 },
          );
        }
      }
    }

    // Sử dụng transaction đã được truyền vào để đảm bảo atomic
    // 1. Lấy wallet hiện tại để save FnetHistory
    const walletResult = await fnetDB.$queryRaw<any[]>`
      SELECT main, sub FROM wallettb 
      WHERE userid = ${userId}
      LIMIT 1
    `;

    if (walletResult.length === 0) {
      throw new Error(`Wallet not found for userId: ${userId}`);
    }

    const oldMain = Number(walletResult[0].main) || 0;
    const oldSub = Number(walletResult[0].sub) || 0;
    const newMain = oldMain; // Main không đổi
    const newSub = oldSub + promoCode.rewardValue;

    console.log(
      `[FREE_HOURS] Wallet snapshot - oldMain: ${oldMain}, newMain: ${newMain}, oldSub: ${oldSub}, newSub: ${newSub}`,
    );

    // 2. Create UserRewardMap với type = EVENT
    const insertResult = await tx.$executeRaw`
      INSERT INTO UserRewardMap (userId, rewardId, promotionCodeId, duration, branch, isUsed, status, type, createdAt, updatedAt)
      VALUES (
        ${userId},
        ${eventRewardId},
        ${promotionCodeId},
        ${promoCode.rewardValue},
        ${branch},
        false,
        'INITIAL',
        'EVENT',
        NOW(),
        NOW()
      )
    `;

    console.log(
      `[FREE_HOURS] Created UserRewardMap - insertResult:`,
      insertResult,
    );

    // Get the inserted UserRewardMap ID
    const userRewardMapResults = await tx.$queryRaw<
      any[]
    >`SELECT LAST_INSERT_ID() as id`;
    const userRewardMapId = Number(userRewardMapResults[0]?.id);

    console.log(`[FREE_HOURS] UserRewardMap ID: ${userRewardMapId}`);

    // 3. Lưu FnetHistory với thay đổi ở subMoney
    await tx.$executeRaw`
      INSERT INTO FnetHistory (userId, branch, oldSubMoney, newSubMoney, oldMainMoney, newMainMoney, moneyType, targetId, type, createdAt, updatedAt)
      VALUES (${userId}, ${branch}, ${oldSub}, ${newSub}, ${oldMain}, ${newMain}, 'SUB', ${userRewardMapId}, 'REWARD', ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
    `;

    console.log(`[FREE_HOURS] Saved FnetHistory`);

    // 4. Mark PromotionCode as used
    await tx.$executeRaw`
      UPDATE PromotionCode 
      SET isUsed = true, updatedAt = NOW()
      WHERE id = ${promotionCodeId}
    `;

    console.log(`[FREE_HOURS] Marked PromotionCode as used`);

    console.log(`[FREE_HOURS] Successfully completed for userId: ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Free hours redeemed successfully",
      amount: promoCode.rewardValue,
    });
  } catch (error) {
    console.error("[FREE_HOURS] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process free hours",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
