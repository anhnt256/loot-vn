import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, getBranchFromCookie } from "@/lib/server-utils";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      description,
      priority,
      category,
      rating,
      image,
      computerId,
    } = body;

    // Validate required fields
    if (!type || !title || !description || !priority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get user info from cookie
    const cookieStore = await cookies();
    const currentUser = await getCurrentUser(cookieStore);
    const branch = await getBranchFromCookie();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convert type to proper enum format
    const feedbackType = type.toUpperCase() as
      | "IMPROVEMENT"
      | "BUG_REPORT"
      | "FEATURE_REQUEST"
      | "GENERAL";

    const currentTime = getCurrentTimeVNISO();

    // Insert feedback into database using Prisma
    const feedback = await db.feedback.create({
      data: {
        userId: currentUser.userId,
        computerId: computerId || null, // Lưu computerId
        branch: branch,
        type: feedbackType,
        title: title,
        description: description,
        priority: priority,
        status: "SUBMITTED",
        category: category || null,
        rating: rating || 0,
        image: image || null,
        createdAt: new Date(currentTime),
        updatedAt: new Date(currentTime),
      },
    });

    return NextResponse.json(
      {
        message: "Feedback submitted successfully",
        statusCode: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentUser = await getCurrentUser(cookieStore);
    const branch = await getBranchFromCookie();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's feedback history using Prisma
    const feedbacks = await db.feedback.findMany({
      where: {
        userId: currentUser.userId,
        branch: branch,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        category: true,
        rating: true,
        image: true,
        computerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        data: feedbacks,
        statusCode: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
