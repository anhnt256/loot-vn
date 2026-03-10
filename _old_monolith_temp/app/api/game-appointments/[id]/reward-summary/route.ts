import { NextRequest, NextResponse } from "next/server";
import { getAppointmentRewardSummary } from "@/lib/reward-distribution";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Get appointment reward summary
    const result = await getAppointmentRewardSummary(params.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Error in GET /api/game-appointments/[id]/reward-summary:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
