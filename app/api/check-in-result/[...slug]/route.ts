import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getStartOfMonthVNISO, getEndOfMonthVNISO } from "@/lib/timezone-utils";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const [userId] = params.slug;

    // Validate input parameters
    if (!userId) {
      return NextResponse.json(
        { error: "User ID and branch are required" },
        { status: 400 },
      );
    }

    // Validate userId is a number
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    const startOfMonth = getStartOfMonthVNISO();
    const endOfMonth = getEndOfMonthVNISO();

    const checkInItems = await db.userStarHistory.findMany({
      where: {
        userId: parsedUserId,
        branch: branch,
        type: "CHECK_IN",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(checkInItems);
  } catch (error) {
    console.error("[CHECK_IN_RESULT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
