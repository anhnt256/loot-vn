import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Tìm user theo userId và branch
    const user = await db.user.findFirst({
      where: {
        userId: parseInt(userId, 10),
        branch: branch,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const whereClause = {
      userId: user.id, // user.id là foreign key trong UserRewardMap
      branch: branch,
    };

    const [rewards, total] = await Promise.all([
      db.userRewardMap.findMany({
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
        skip: offset,
        take: limit,
      }),
      db.userRewardMap.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      rewards: rewards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[REWARD_EXCHANGE_USER_HISTORY_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
