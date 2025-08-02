import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, getBranchFromCookie } from "@/lib/server-utils";

import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const currentUser = await getCurrentUser(cookieStore);
    const branch = await getBranchFromCookie();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feedbackId = parseInt(params.id);
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: "Invalid feedback ID" },
        { status: 400 },
      );
    }

    // Get feedback detail with user info using Prisma
    const feedback = await db.feedback.findFirst({
      where: {
        id: feedbackId,
        branch: branch,
      },
      include: {
        user: {
          select: {
            userName: true,
            userId: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    // Transform data to match expected format
    const transformedFeedback = {
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
      response: feedback.response,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      userName: feedback.user?.userName || null,
      userUserId: feedback.user?.userId || null,
    };

    return NextResponse.json(
      {
        success: true,
        data: transformedFeedback,
        statusCode: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in feedback detail GET:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
