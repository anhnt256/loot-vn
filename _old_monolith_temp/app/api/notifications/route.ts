import { NextRequest, NextResponse } from "next/server";
import { getUserNotifications } from "@/lib/game-appointment-notifications";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = parseInt(decoded.userId.toString());
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get user notifications
    const notifications = await getUserNotifications(userId, limit, offset);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          limit,
          offset,
          hasMore: notifications.length === limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
