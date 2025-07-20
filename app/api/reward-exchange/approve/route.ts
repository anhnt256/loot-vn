import { NextRequest, NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";
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
        WHERE id = ${rewardMap[0].userId} 
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
            updatedAt = NOW()
        WHERE id = ${rewardMapId}
      `;

      if (action === "APPROVE") {
        // Mark promotion code as used
        if (rewardMap[0].promotionCodeId) {
          await tx.$executeRaw`
            UPDATE PromotionCode 
            SET isUsed = true, updatedAt = NOW()
            WHERE id = ${rewardMap[0].promotionCodeId}
          `;
        }

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
            ${user[0].stars + (rewardMap[0].reward_stars || 0)},
            ${user[0].stars},
            ${rewardMapId},
            NOW(),
            ${branch}
          )
        `;

        // Update money in fnet database
        if (rewardMap[0].reward_value && user[0].userId) {
          const fnetDB = await getFnetDB();

          const fnetUser = await fnetDB.$queryRaw<any[]>`
            SELECT UserId, RemainMoney FROM usertb 
            WHERE UserId = ${user[0].userId}
            LIMIT 1
          `;

          if (fnetUser.length > 0) {
            const today = new Date();
            today.setFullYear(today.getFullYear() - 20);
            const todayFormatted =
              today.toISOString().split("T")[0] + "T00:00:00.000Z";

            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 10);
            const expiryDateFormatted =
              expiryDate.toISOString().split("T")[0] + "T00:00:00.000Z";

            await fnetDB.$executeRaw`
              UPDATE usertb 
              SET RemainMoney = ${Number(fnetUser[0].RemainMoney) + Number(rewardMap[0].reward_value)},
                  Birthdate = ${todayFormatted},
                  ExpiryDate = ${expiryDateFormatted}
              WHERE UserId = ${user[0].userId}
            `;
          }
        }
      } else if (action === "REJECT") {
        // Hoàn trả số sao cho user khi từ chối
        if (rewardMap[0].reward_stars) {
          await tx.$executeRaw`
            UPDATE User 
            SET stars = ${Number(user[0].stars) + Number(rewardMap[0].reward_stars)},
                updatedAt = NOW()
            WHERE id = ${user[0].id}
          `;
        }
      }
    });

    // Gọi user-calculator để cập nhật thông tin user sau khi xử lý
    try {
      if (user[0].userId) {
        await calculateActiveUsersInfo([user[0].userId], branch);
        console.log(
          `User calculator called for userId: ${user[0].userId} after ${action.toLowerCase()}ing reward exchange`,
        );
      }
    } catch (calculatorError) {
      console.error(
        "Error calling user-calculator after reward exchange approval:",
        calculatorError,
      );
      // Không fail request nếu user-calculator lỗi, chỉ log lỗi
    }

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
