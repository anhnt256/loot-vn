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
    let dateFilter = {};

    if (startDate && endDate) {
      // Sử dụng date range
      dateFilter = {
        createdAt: {
          gte: new Date(startDate + "T00:00:00.000Z"),
          lte: new Date(endDate + "T23:59:59.999Z"),
        },
      };
    } else if (date) {
      // Fallback cho single date (backward compatibility)
      dateFilter = {
        createdAt: {
          gte: new Date(date + "T00:00:00.000Z"),
          lt: new Date(date + "T23:59:59.999Z"),
        },
      };
    }

    const whereClause: any = {
      branch: branch,
      status: {
        in: ["APPROVE", "REJECT"],
      },
      ...dateFilter,
    };

    if (status && status !== "ALL" && ["APPROVE", "REJECT"].includes(status)) {
      whereClause.status = status;
    }

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
          updatedAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      db.userRewardMap.count({
        where: whereClause,
      }),
    ]);

    // Join with User table manually
    const rewardsWithUser = await Promise.all(
      rewards.map(async (reward) => {
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

    return NextResponse.json({
      rewards: rewardsWithUser,
      pagination: {
        page,
        limit,
        total,
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
