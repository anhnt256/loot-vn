import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, getBranchFromCookie } from "@/lib/server-utils";

import { getCurrentTimeVNISO } from "@/lib/timezone-utils";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { response, status } = body;

    const cookieStore = await cookies();
    const currentUser = await getCurrentUser(cookieStore);
    const branch = await getBranchFromCookie();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!response || !response.trim()) {
      return NextResponse.json(
        { error: "Response content is required" },
        { status: 400 },
      );
    }

    const currentTime = getCurrentTimeVNISO();

    // Update feedback with response using Prisma
    const updatedFeedback = await db.feedback.update({
      where: {
        id: parseInt(id),
        branch: branch,
      },
      data: {
        response: response.trim(),
        status: status || "PROCESSING",
        updatedAt: new Date(currentTime),
      },
    });

    return NextResponse.json(
      {
        message: "Response submitted successfully",
        statusCode: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting feedback response:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
