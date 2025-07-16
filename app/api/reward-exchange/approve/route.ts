import { NextResponse } from "next/server";
import { db, getFnetDB } from "@/lib/db";
import { cookies } from "next/headers";
import { getVNTimeForPrisma } from "@/lib/timezone-utils";
import { calculateActiveUsersInfo } from "@/lib/user-calculator";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    // const staffId = cookieStore.get("staffId")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    // if (!staffId) {
    //   return NextResponse.json(
    //     { error: "Staff ID is required" },
    //     { status: 400 }
    //   );
    // }

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
    const rewardMap = await db.userRewardMap.findFirst({
      where: {
        id: rewardMapId,
        branch: branch,
        status: "INITIAL",
      },
      include: {
        reward: true,
        promotionCode: true,
      },
    });

    if (!rewardMap) {
      return NextResponse.json(
        { error: "Reward exchange not found or already processed" },
        { status: 404 },
      );
    }

    // Get user info manually
    let user = null;
    if (rewardMap.userId) {
      // rewardMap.userId là User.id (foreign key), cần tìm user thực tế
      user = await db.user.findFirst({
        where: {
          id: rewardMap.userId, // Tìm theo User.id (foreign key)
          branch: branch,
        },
        select: {
          id: true,
          userId: true, // Business identifier
          userName: true,
          stars: true,
          branch: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Update reward map status
      await tx.userRewardMap.update({
        where: { id: rewardMapId },
        data: {
          status: action === "APPROVE" ? "APPROVE" : "REJECT",
          note: note || null,
          updatedAt: getVNTimeForPrisma(),
        },
      });

      if (action === "APPROVE") {
        // Mark promotion code as used
        if (rewardMap.promotionCodeId) {
          await tx.promotionCode.update({
            where: { id: rewardMap.promotionCodeId },
            data: {
              isUsed: true,
              updatedAt: getVNTimeForPrisma(),
            },
          });
        }

        // Mark reward map as used
        await tx.userRewardMap.update({
          where: { id: rewardMapId },
          data: {
            isUsed: true,
          },
        });

        await tx.userStarHistory.create({
          data: {
            userId: user.userId,
            type: "REWARD",
            oldStars: user?.stars + (rewardMap?.reward?.stars || 0),
            newStars: user?.stars,
            targetId: rewardMapId,
            createdAt: getVNTimeForPrisma(),
            branch,
          },
        });

        // Update money in fnet database
        if (rewardMap.reward?.value && user.userId) {
          const fnetDB = await getFnetDB();

          const fnetUser = await fnetDB.usertb.findFirst({
            where: {
              UserId: user.userId,
            },
            select: {
              UserId: true,
              RemainMoney: true,
            },
          });

          if (fnetUser) {
            const today = new Date();
            today.setFullYear(today.getFullYear() - 20);
            const todayFormatted =
              today.toISOString().split("T")[0] + "T00:00:00.000Z";

            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 10);
            const expiryDateFormatted =
              expiryDate.toISOString().split("T")[0] + "T00:00:00.000Z";

            await fnetDB.usertb.update({
              where: {
                UserId: user.userId,
              },
              data: {
                RemainMoney:
                  Number(fnetUser.RemainMoney) + Number(rewardMap.reward.value),
                Birthdate: todayFormatted,
                ExpiryDate: expiryDateFormatted,
              },
            });
          }
        }
      } else if (action === "REJECT") {
        // Hoàn trả số sao cho user khi từ chối
        if (rewardMap.reward?.stars) {
          await tx.user.update({
            where: {
              id: user.id,
            },
            data: {
              stars: Number(user.stars) + Number(rewardMap.reward.stars),
            },
          });
        }
      }
    });

    // Gọi user-calculator để cập nhật thông tin user sau khi xử lý
    try {
      if (user.userId) {
        await calculateActiveUsersInfo([user.userId], branch);
        console.log(
          `User calculator called for userId: ${user.userId} after ${action.toLowerCase()}ing reward exchange`,
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
