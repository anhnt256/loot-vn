import { NextRequest, NextResponse } from "next/server";
import { getUserRewardHistory } from '@/lib/reward-distribution';
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const branch = cookieStore.get("branch")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch cookie is required" },
        { status: 400 }
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = parseInt(decoded.userId);
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // Get user reward history
    const result = await getUserRewardHistory(userId, branch, limit, offset);
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error("Error in GET /api/user/rewards:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
