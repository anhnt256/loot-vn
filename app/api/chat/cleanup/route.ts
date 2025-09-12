import { NextRequest, NextResponse } from "next/server";
import { cleanupOldMessages } from "@/lib/chat-utils";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
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
        { status: 400 }
      );
    }

    const { daysOld = 30 } = await req.json();

    if (daysOld < 1 || daysOld > 365) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Days old must be between 1 and 365",
          data: null,
        },
        { status: 400 }
      );
    }

    const deletedCount = await cleanupOldMessages(branchFromCookie, daysOld);

    return NextResponse.json(
      {
        statusCode: 200,
        message: "Cleanup completed successfully",
        data: {
          deletedMessages: deletedCount,
          daysOld,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cleaning up messages:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
