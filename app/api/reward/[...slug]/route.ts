import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import { db } from "@/lib/db";
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

    const [userId, requestBranch] = params.slug;

    // Validate input parameters
    if (!userId || !requestBranch) {
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

    // Validate branch matches cookie
    if (requestBranch !== branch) {
      return NextResponse.json({ error: "Branch mismatch" }, { status: 403 });
    }

    const rewards = await db.userRewardMap.findMany({
      where: {
        userId: parsedUserId,
        branch: requestBranch,
        isUsed: false,
      },
      include: {
        promotionCode: {
          select: { code: true, name: true, createdAt: true },
          where: { isUsed: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error("[REWARD_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
