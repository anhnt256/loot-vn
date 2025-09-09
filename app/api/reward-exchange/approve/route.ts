import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNISO, getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { calculateActiveUsersInfo } from "@/lib/user-calculator";

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
        pr.name as rewardName,
        pr.value as rewardValue,
        pr.starsValue as rewardStars
      FROM UserRewardMap urm
      LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id
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
      // Update reward map status
      await tx.$executeRaw`
        UPDATE UserRewardMap 
        SET status = ${action === "APPROVE" ? "APPROVE" : "REJECT"},
            note = ${note || null},
            updatedAt = ${getCurrentTimeVNDB()}
        WHERE id = ${rewardMapId}
      `;

      if (action === "APPROVE") {
        // Không cần update PromotionReward vì đã giảm quantity khi tạo request

        // Mark reward map as used
        await tx.$executeRaw`
          UPDATE UserRewardMap 
          SET isUsed = true
          WHERE id = ${rewardMapId}
        `;

        await tx.$executeRaw`
          INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
          VALUES (
            ${user[0].userId},
            'REWARD',
            ${user[0].stars + (rewardMap[0].rewardStars || 0)},
            ${user[0].stars},
            ${rewardMapId},
            ${getCurrentTimeVNDB()},
            ${branch}
          )
        `;

        // Update money in fnet database
        if (rewardMap[0].rewardValue && user[0].userId) {
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

          // Lấy thông tin tài khoản duy nhất
          const fnetUser = await fnetDB.$queryRaw<any[]>`
            SELECT UserId, RemainMoney FROM usertb 
            WHERE UserId = ${user[0].userId}
            LIMIT 1
          `;

          if (fnetUser.length > 0) {
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

            const oldMoney = fnetUser[0].RemainMoney;
            const newMoney =
              Number(oldMoney) + Number(rewardMap[0].rewardValue);

            console.log(
              `Processing reward for user ${user[0].userId}: ${oldMoney} + ${rewardMap[0].rewardValue} = ${newMoney}`,
            );

            // Lưu lịch sử thay đổi số dư TRƯỚC khi update (trong transaction chính)
            await tx.$executeRaw`
              INSERT INTO FnetHistory (userId, branch, oldMoney, newMoney, targetId, type, createdAt, updatedAt)
              VALUES (${user[0].userId}, ${branch}, ${oldMoney}, ${newMoney}, ${rewardMapId}, 'REWARD', ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
            `;

            console.log(
              `FnetHistory saved for user ${user[0].userId}: ${oldMoney} -> ${newMoney}`,
            );

            const today = new Date();
            today.setFullYear(today.getFullYear() - 20);
            const todayFormatted =
              today.toISOString().split("T")[0] + "T00:00:00.000Z";

            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 10);
            const expiryDateFormatted =
              expiryDate.toISOString().split("T")[0] + "T00:00:00.000Z";

            // Update user SAU khi đã lưu lịch sử
            try {
              await fnetDB.$executeRaw`
                UPDATE usertb 
                SET RemainMoney = ${newMoney},
                    Birthdate = ${todayFormatted},
                    ExpiryDate = ${expiryDateFormatted}
                WHERE UserId = ${user[0].userId}
              `;

              console.log(
                `Updated user ${user[0].userId} money: ${oldMoney} -> ${newMoney}`,
              );
            } catch (error) {
              console.error(
                `Error updating fnet usertb for user ${user[0].userId}:`,
                error,
              );
              throw new Error(
                `Failed to update fnet user money: ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          }
        }
      } else if (action === "REJECT") {
        // Hoàn trả số sao cho user khi từ chối
        if (rewardMap[0].rewardStars) {
          await tx.$executeRaw`
            UPDATE User 
            SET stars = ${Number(user[0].stars) + Number(rewardMap[0].rewardStars)},
                updatedAt = ${getCurrentTimeVNDB()}
            WHERE id = ${user[0].id}
          `;
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
