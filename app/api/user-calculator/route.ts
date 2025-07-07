import { NextRequest, NextResponse } from "next/server";
import { calculateActiveUsersInfo } from "@/lib/user-calculator";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branchFromCookie = cookieStore.get("branch")?.value;

    if (!branchFromCookie) {
      return NextResponse.json(
        { error: "Branch not found in cookies" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { listUsers }: { listUsers: number[] } = body;

    if (!listUsers || !Array.isArray(listUsers)) {
      return NextResponse.json(
        { error: "listUsers array is required" },
        { status: 400 },
      );
    }

    const results = await calculateActiveUsersInfo(listUsers, branchFromCookie);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("User calculator API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "User Calculator API",
    usage: "POST with { activeUsers: [{ UserId: string, UserType?: string }] }",
  });
}
