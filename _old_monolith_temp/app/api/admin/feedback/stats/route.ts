import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, getBranchFromCookie } from "@/lib/server-utils";

import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentUser = await getCurrentUser(cookieStore);
    const branch = await getBranchFromCookie();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestBranch = searchParams.get("branch");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Use request branch if provided, otherwise use current branch
    const targetBranch = requestBranch || branch;

    // Build where conditions for date filtering
    const whereConditions: any = {
      branch: targetBranch,
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include the end date
      whereConditions.createdAt = {
        gte: start,
        lt: end,
      };
    } else if (startDate) {
      const start = new Date(startDate);
      whereConditions.createdAt = {
        gte: start,
      };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include the end date
      whereConditions.createdAt = {
        lt: end,
      };
    }

    // Get feedback statistics using Prisma
    const [
      total,
      submitted,
      received,
      processing,
      completed,
      highPriority,
      mediumPriority,
      lowPriority,
      averageRating,
    ] = await Promise.all([
      db.feedback.count({ where: whereConditions }),
      db.feedback.count({ where: { ...whereConditions, status: "SUBMITTED" } }),
      db.feedback.count({ where: { ...whereConditions, status: "RECEIVED" } }),
      db.feedback.count({
        where: { ...whereConditions, status: "PROCESSING" },
      }),
      db.feedback.count({ where: { ...whereConditions, status: "COMPLETED" } }),
      db.feedback.count({ where: { ...whereConditions, priority: "HIGH" } }),
      db.feedback.count({ where: { ...whereConditions, priority: "MEDIUM" } }),
      db.feedback.count({ where: { ...whereConditions, priority: "LOW" } }),
      db.feedback.aggregate({
        where: whereConditions,
        _avg: { rating: true },
      }),
    ]);

    // Get feedback by category
    const categoryStats = await db.feedback.groupBy({
      by: ["category"],
      where: {
        ...whereConditions,
        category: { not: null },
      },
      _count: {
        category: true,
      },
      _avg: {
        rating: true,
      },
      orderBy: {
        _count: {
          category: "desc",
        },
      },
    });

    // Get recent feedback (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStats = await db.feedback.groupBy({
      by: ["createdAt"],
      where: {
        ...whereConditions,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        stats: {
          total,
          submitted,
          received,
          processing,
          completed,
          highPriority,
          mediumPriority,
          lowPriority,
          averageRating: averageRating._avg.rating
            ? parseFloat(averageRating._avg.rating.toString()).toFixed(1)
            : "0.0",
        },
        byCategory: categoryStats.map((stat) => ({
          category: stat.category,
          count: stat._count.category,
          averageRating: stat._avg.rating
            ? parseFloat(stat._avg.rating.toString()).toFixed(1)
            : "0.0",
        })),
        recentActivity: recentStats.map((stat) => ({
          count: stat._count.id,
          date: stat.createdAt.toISOString().split("T")[0],
        })),
        statusCode: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
