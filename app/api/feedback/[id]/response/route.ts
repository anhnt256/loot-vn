import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { addFeedbackResponse } from "@/actions/add-feedback-response";

export async function POST(
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
    const [staffRows] = await db.execute(
      `SELECT isAdmin FROM Staff WHERE id = ? AND branch = ?`,
      [adminId, branch],
    );

    const staff = (staffRows as any[])[0];
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

    const result = await addFeedbackResponse(
      { ...body, feedbackId },
      parseInt(adminId),
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in feedback response POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
