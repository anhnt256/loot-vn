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
    const userId = searchParams.get("userId");

    if (!branch) {
      return NextResponse.json(
        { error: "Branch is required" },
        { status: 400 },
      );
    }

    const whereClause: any = {
      status: "INITIAL",
      branch: branch,
    };

    // Nếu có userId, lọc theo user cụ thể
    if (userId) {
      const user = await db.user.findFirst({
        where: {
          userId: parseInt(userId, 10),
          branch: branch,
        },
      });

      if (user) {
        whereClause.userId = user.id; // user.id là foreign key trong UserRewardMap
      }
    }

    const pendingRewards = await db.userRewardMap.findMany({
      where: whereClause,
      include: {
        reward: {
          select: {
            id: true,
            name: true,
            value: true,
            stars: true,
          },
        },
        promotionCode: {
          select: {
            id: true,
            code: true,
            name: true,
            value: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Join with User table manually
    const rewardsWithUser = await Promise.all(
      pendingRewards.map(async (reward) => {
        let user = null;
        if (reward.userId) {
          // reward.userId là User.id (foreign key), cần tìm user thực tế
          user = await db.user.findFirst({
            where: {
              id: reward.userId, // Tìm theo User.id (foreign key)
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
        return {
          ...reward,
          user,
        };
      }),
    );

    return NextResponse.json(rewardsWithUser);
  } catch (error) {
    console.error("[REWARD_EXCHANGE_PENDING_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
