import { NextRequest, NextResponse } from "next/server";
import { getChatStats } from "@/lib/chat-utils";
import { cookies } from "next/headers";
import { chatCache } from "@/lib/chat-cache";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branchFromCookie = cookieStore.get("branch")?.value;

    if (!branchFromCookie) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Branch cookie is required",
          data: null,
        },
        { status: 400 },
      );
    }

    // Try to get cached stats first
    let stats = await chatCache.getCachedStats(branchFromCookie);

    if (!stats) {
      stats = await getChatStats(branchFromCookie);
      // Cache the stats
      await chatCache.cacheStats(branchFromCookie, stats);
    }

    return NextResponse.json(
      {
        statusCode: 200,
        message: "Chat statistics retrieved successfully",
        data: stats,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching chat stats:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}
