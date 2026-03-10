import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, getBranchFromCookie } from "@/lib/server-utils";

import { getCurrentTimeVNISO } from "@/lib/timezone-utils";
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
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const requestBranch = searchParams.get("branch");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Use request branch if provided, otherwise use current branch
    const targetBranch = requestBranch || branch;

    // Build where conditions
    const whereConditions: any = {
      branch: targetBranch,
    };

    if (status) {
      whereConditions.status = status;
    }

    if (category) {
      whereConditions.category = category;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

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

    // Get feedback with user info
    const feedbacks = await db.feedback.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            userName: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const total = await db.feedback.count({
      where: whereConditions,
    });

    // Transform data to match expected format
    const transformedFeedbacks = feedbacks.map((feedback) => ({
      id: feedback.id,
      userId: feedback.userId,
      type: feedback.type,
      title: feedback.title,
      description: feedback.description,
      priority: feedback.priority,
      status: feedback.status,
      category: feedback.category,
      rating: feedback.rating,
      image: feedback.image,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      userName: feedback.user?.userName || null,
      userUserId: feedback.user?.userId || null,
    }));

    return NextResponse.json(
      {
        success: true,
        data: transformedFeedbacks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        statusCode: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching admin feedback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, response } = body;

    const cookieStore = await cookies();
    const currentUser = await getCurrentUser(cookieStore);
    const branch = await getBranchFromCookie();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 },
      );
    }

    const currentTime = getCurrentTimeVNISO();

    // Update feedback using Prisma
    const updatedFeedback = await db.feedback.update({
      where: {
        id: parseInt(id),
        branch: branch,
      },
      data: {
        status: status || "SUBMITTED",
        response: response || null,
        updatedAt: new Date(currentTime),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feedback updated successfully",
        statusCode: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
