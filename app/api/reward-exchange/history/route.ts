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
      ...dateFilter,
    };

    // Add status filter if provided
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    // Get UserRewardMap records first
    const allUserRewardMaps = await db.userRewardMap.findMany({
      where: whereClause,
      include: {
        reward: {
          select: {
            id: true,
            name: true,
            value: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Apply pagination
    const total = allUserRewardMaps.length;
    const paginatedUserRewardMaps = allUserRewardMaps.slice(offset, offset + limit);

    // Join with User table and UserStarHistory (only for APPROVE status)
    const historiesWithUser = await Promise.all(
      paginatedUserRewardMaps.map(async (userRewardMap) => {
        let user = null;
        let userStarHistory = null;

        // Get user information
        if (userRewardMap.userId) {
          user = await db.user.findFirst({
            where: {
              id: userRewardMap.userId, // Tìm theo User.id (foreign key)
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

        // Get UserStarHistory only if status is APPROVE
        if (userRewardMap.status === "APPROVE" && userRewardMap.id) {
          userStarHistory = await db.userStarHistory.findFirst({
            where: {
              targetId: userRewardMap.id,
              branch: branch,
              type: "REWARD",
            },
            select: {
              id: true,
              oldStars: true,
              newStars: true,
              createdAt: true,
            },
          });
        }

        return {
          id: userRewardMap.id,
          userId: userRewardMap.userId,
          rewardId: userRewardMap.rewardId,
          status: userRewardMap.status,
          note: userRewardMap.note,
          createdAt: userRewardMap.createdAt,
          updatedAt: userRewardMap.updatedAt,
          reward: userRewardMap.reward,
          user,
          userStarHistory, // oldStars, newStars info for APPROVE status
        };
      }),
    );

    console.log('histories', historiesWithUser)
    console.log('total', total)

    return NextResponse.json({
      histories: historiesWithUser,
      pagination: {
        page,
        limit,
        total: total,
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
