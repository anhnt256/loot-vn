import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNISO, getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { calculateActiveUsersInfo } from "@/lib/user-calculator";
import { updateFnetMoney } from "@/lib/fnet-money-utils";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { rewardMapId, action, note } = body;

    if (!rewardMapId || !action) {
      return NextResponse.json(
        { error: "Reward map ID and action are required" },
        { status: 400 },
      );
    }

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be APPROVE or REJECT" },
        { status: 400 },
      );
    }

    // Get the reward map
    const rewardMap = await db.$queryRaw<any[]>`
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
        pc.eventId as eventId,
        pc.rewardType as eventRewardType,
        pc.rewardValue as eventRewardValue
      FROM UserRewardMap urm
      LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id AND urm.type = 'STARS'
      LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id AND urm.type = 'EVENT'
      WHERE urm.id = ${rewardMapId}
        AND urm.branch = ${branch}
        AND urm.status = 'INITIAL'
      LIMIT 1
    `;

    if (rewardMap.length === 0) {
      return NextResponse.json(
        { error: "Reward exchange not found or already processed" },
        { status: 404 },
      );
    }

    // Get user info manually
    let user = null;
    if (rewardMap[0].userId) {
      user = await db.$queryRaw<any[]>`
        SELECT id, userId, userName, stars, branch FROM User 
        WHERE userId = ${rewardMap[0].userId} 
        AND branch = ${branch}
        LIMIT 1
      `;
    }

    if (!user || user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Lock and re-check status to prevent race condition
      const lockedRewardMap = await tx.$queryRaw<any[]>`
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
          pc.eventId as eventId,
          pc.rewardType as eventRewardType,
          pc.rewardValue as eventRewardValue
        FROM UserRewardMap urm
        LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id AND urm.type = 'STARS'
        LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id AND urm.type = 'EVENT'
        WHERE urm.id = ${rewardMapId}
          AND urm.branch = ${branch}
          AND urm.status = 'INITIAL'
        LIMIT 1
        FOR UPDATE
      `;

      if (lockedRewardMap.length === 0) {
        throw new Error("Reward exchange not found or already processed");
      }

      // Update reward map status
      await tx.$executeRaw`
        UPDATE UserRewardMap 
        SET status = ${action === "APPROVE" ? "APPROVE" : "REJECT"},
            note = ${note || null},
            updatedAt = ${getCurrentTimeVNDB()}
        WHERE id = ${rewardMapId}
          AND status = 'INITIAL'
      `;

      if (action === "APPROVE") {
        const currentTime = getCurrentTimeVNDB();
        const rewardType = lockedRewardMap[0].type;

        // Mark reward map as used
        await tx.$executeRaw`
          UPDATE UserRewardMap 
          SET isUsed = true
          WHERE id = ${rewardMapId}
        `;

        // Xử lý theo type
        if (rewardType === "EVENT") {
          console.log("[APPROVE EVENT] Processing event reward:", lockedRewardMap[0]);

          // 1. Update PromotionCode status thành đã sử dụng
          if (lockedRewardMap[0].promotionCodeId) {
            await tx.$executeRaw`
              UPDATE PromotionCode 
              SET isUsed = true, updatedAt = NOW()
              WHERE id = ${lockedRewardMap[0].promotionCodeId}
            `;
            console.log(
              "[APPROVE EVENT] Updated PromotionCode:",
              lockedRewardMap[0].promotionCodeId,
            );
          }

          // 2. Update UserRewardMap để track việc sử dụng event reward
          // UserRewardMap đã có field isUsed = true ở trên, không cần thêm bảng riêng
          console.log(
            "[APPROVE EVENT] Event reward usage tracked via UserRewardMap.isUsed = true",
          );

          // 3. Xử lý FREE_HOURS - update Fnet money
          if (
            lockedRewardMap[0].eventRewardType === "FREE_HOURS" &&
            lockedRewardMap[0].eventRewardValue &&
            user[0].userId
          ) {
            const fnetDB = await getFnetDB();

            // Kiểm tra user có bao nhiêu tài khoản
            const fnetUserCount = await fnetDB.$queryRaw<any[]>`
              SELECT COUNT(*) as count FROM usertb 
              WHERE UserId = ${user[0].userId}
            `;

            if (fnetUserCount[0].count > 1) {
              throw new Error(
                `User ${user[0].userId} has multiple accounts (${fnetUserCount[0].count}). Cannot process reward exchange.`,
              );
            }

            if (fnetUserCount[0].count === 0) {
              throw new Error(
                `User ${user[0].userId} not found in fnet database.`,
              );
            }

            // Kiểm tra xem user có đang sử dụng máy không (từ systemlogtb - giống user-calculator)
            const activeSession = await fnetDB.$queryRaw<any[]>`
              SELECT s.UserId, s.MachineName, s.EnterDate, s.EnterTime, s.status
              FROM systemlogtb s
              WHERE s.UserId = ${user[0].userId} 
                AND s.status = 3 
                AND s.EnterDate = CURDATE()
                AND s.EndDate IS NULL
              ORDER BY s.EnterTime DESC
              LIMIT 1
            `;

            if (activeSession.length > 0) {
              // Verify userId có trùng không
              if (activeSession[0].UserId !== user[0].userId) {
                throw new Error(
                  `UserId mismatch: Active session has userId ${activeSession[0].UserId} but reward is for ${user[0].userId}`,
                );
              }

              console.log(
                `User ${user[0].userId} is currently using machine ${activeSession[0].MachineName} since ${activeSession[0].EnterDate} ${activeSession[0].EnterTime}`,
              );
            } else {
              console.log(
                `User ${user[0].userId} is not currently using any machine`,
              );
            }

            console.log(
              `[APPROVE EVENT] Processing FREE_HOURS for user ${user[0].userId}: amount ${lockedRewardMap[0].eventRewardValue}`,
            );

            // Use updateFnetMoney utility function (saveHistory = false vì đã lưu khi user request)
            await updateFnetMoney({
              userId: user[0].userId,
              branch: branch,
              walletType: "SUB",
              amount: Number(lockedRewardMap[0].eventRewardValue),
              targetId: rewardMapId,
              transactionType: "REWARD",
              saveHistory: false,
            });

            console.log(
              `[APPROVE EVENT] Successfully updated fnet money for user ${user[0].userId}`,
            );
          }

          // 4. Xử lý MAIN_ACCOUNT_TOPUP - update Fnet money (MAIN account)
          if (
            lockedRewardMap[0].eventRewardType === "MAIN_ACCOUNT_TOPUP" &&
            lockedRewardMap[0].eventRewardValue &&
            user[0].userId
          ) {
            const fnetDB = await getFnetDB();

            // Kiểm tra user có bao nhiêu tài khoản
            const fnetUserCount = await fnetDB.$queryRaw<any[]>`
              SELECT COUNT(*) as count FROM usertb 
              WHERE UserId = ${user[0].userId}
            `;

            if (fnetUserCount[0].count > 1) {
              throw new Error(
                `User ${user[0].userId} has multiple accounts (${fnetUserCount[0].count}). Cannot process reward exchange.`,
              );
            }

            if (fnetUserCount[0].count === 0) {
              throw new Error(
                `User ${user[0].userId} not found in fnet database.`,
              );
            }

            console.log(
              `[APPROVE EVENT] Processing MAIN_ACCOUNT_TOPUP for user ${user[0].userId}: amount ${lockedRewardMap[0].eventRewardValue}`,
            );

            // Use updateFnetMoney utility function (saveHistory = false vì đã lưu khi user redeem)
            await updateFnetMoney({
              userId: user[0].userId,
              branch: branch,
              walletType: "MAIN",
              amount: Number(lockedRewardMap[0].eventRewardValue),
              targetId: rewardMapId,
              transactionType: "REWARD",
              saveHistory: false,
            });

            console.log(
              `[APPROVE EVENT] Successfully updated fnet MAIN account money for user ${user[0].userId}`,
            );
          }
        } else if (rewardType === "STARS") {
          // Xử lý STARS reward (logic cũ)
          console.log("[APPROVE STARS] Processing stars reward:", lockedRewardMap[0]);

          // Insert UserStarHistory
          await tx.$executeRaw`
            INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
            VALUES (
              ${user[0].userId},
              'REWARD',
              ${user[0].stars + (lockedRewardMap[0].rewardStars || 0)},
              ${user[0].stars},
              ${rewardMapId},
              ${getCurrentTimeVNDB()},
              ${branch}
            )
          `;

          // Update money in fnet database
          if (lockedRewardMap[0].rewardValue && user[0].userId) {
            const fnetDB = await getFnetDB();

            // Kiểm tra user có bao nhiêu tài khoản
            const fnetUserCount = await fnetDB.$queryRaw<any[]>`
              SELECT COUNT(*) as count FROM usertb 
              WHERE UserId = ${user[0].userId}
            `;

            if (fnetUserCount[0].count > 1) {
              throw new Error(
                `User ${user[0].userId} has multiple accounts (${fnetUserCount[0].count}). Cannot process reward exchange.`,
              );
            }

            if (fnetUserCount[0].count === 0) {
              throw new Error(
                `User ${user[0].userId} not found in fnet database.`,
              );
            }

            console.log(
              `[APPROVE STARS] Processing reward for user ${user[0].userId}: amount ${lockedRewardMap[0].rewardValue}`,
            );

            // Use updateFnetMoney utility function (saveHistory = false vì đã lưu khi user request)
            await updateFnetMoney({
              userId: user[0].userId,
              branch: branch,
              walletType: "SUB",
              amount: Number(lockedRewardMap[0].rewardValue),
              targetId: rewardMapId,
              transactionType: "REWARD",
              saveHistory: false,
            });

            console.log(
              `[APPROVE STARS] Successfully updated fnet money for user ${user[0].userId}`,
            );
          }
        }
      } else if (action === "REJECT") {
        const rewardType = lockedRewardMap[0].type;

        if (rewardType === "EVENT") {
          // Xử lý REJECT cho EVENT - revert rewardsReceived
          console.log("[REJECT EVENT] Processing event reward:", lockedRewardMap[0]);
          console.log("[REJECT EVENT] eventId:", lockedRewardMap[0].eventId);
          console.log(
            "[REJECT EVENT] promotionCodeId:",
            lockedRewardMap[0].promotionCodeId,
          );
          console.log("[REJECT EVENT] userId:", user[0].userId);
          console.log("[REJECT EVENT] branch:", branch);

          if (lockedRewardMap[0].promotionCodeId) {
            // KHÔNG xóa khỏi rewardsReceived - đó là lịch sử claim
            // Revert PromotionCode về isUsed = false để user có thể redeem lại
            // Logic hiển thị sẽ dựa vào UserRewardMap.status

            console.log(
              "[REJECT EVENT] Keeping rewardsReceived intact - it is claim history",
            );
            console.log(
              "[REJECT EVENT] Reverting PromotionCode isUsed to false:",
              lockedRewardMap[0].promotionCodeId,
            );

            // Revert PromotionCode về isUsed = false
            await tx.$executeRaw`
              UPDATE PromotionCode 
              SET isUsed = false 
              WHERE id = ${lockedRewardMap[0].promotionCodeId}
            `;

            console.log(
              "[REJECT EVENT] PromotionCode reverted to isUsed = false",
            );
          }
        } else if (rewardType === "STARS") {
          // Hoàn trả số sao cho user khi từ chối STARS reward
          if (lockedRewardMap[0].rewardStars) {
            await tx.$executeRaw`
              UPDATE User 
              SET stars = ${Number(user[0].stars) + Number(lockedRewardMap[0].rewardStars)},
                  updatedAt = ${getCurrentTimeVNDB()}
              WHERE id = ${user[0].id}
            `;
            console.log(
              "[REJECT STARS] Refunded stars to user:",
              lockedRewardMap[0].rewardStars,
            );
          }
        }
      }
    });

    // // Gọi user-calculator để cập nhật thông tin user sau khi xử lý
    // try {
    //   if (user[0].userId) {
    //     await calculateActiveUsersInfo([user[0].userId], branch);
    //     console.log(
    //       `User calculator called for userId: ${user[0].userId} after ${action.toLowerCase()}ing reward exchange`,
    //     );
    //   }
    // } catch (calculatorError) {
    //   console.error(
    //     "Error calling user-calculator after reward exchange approval:",
    //     calculatorError,
    //   );
    //   // Không fail request nếu user-calculator lỗi, chỉ log lỗi
    // }

    return NextResponse.json({
      success: true,
      message: `Reward exchange ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error("[REWARD_EXCHANGE_APPROVE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
