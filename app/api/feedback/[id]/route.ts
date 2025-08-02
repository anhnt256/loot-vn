import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { updateFeedbackStatus } from "@/actions/update-feedback-status";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feedbackId = parseInt(params.id);
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: "Invalid feedback ID" },
        { status: 400 },
      );
    }

    const feedback = await db.feedback.findFirst({
      where: {
        id: feedbackId,
        userId: parseInt(userId),
        branch: branch
      },
      include: {
        computer: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error in feedback detail GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("userId")?.value;
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const staff = await db.staff.findFirst({
      where: {
        id: parseInt(adminId),
        branch: branch
      },
      select: {
        isAdmin: true
      }
    });
    if (!staff || !staff.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const feedbackId = parseInt(params.id);

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: "Invalid feedback ID" },
        { status: 400 },
      );
    }

    const result = await updateFeedbackStatus(
      { ...body, feedbackId }
    );

    if (!result.data) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in feedback PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
