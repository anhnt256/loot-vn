import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentReminders } from "@/lib/game-appointment-notifications";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
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

    // Check if user is admin (userId -99 is admin)
    const userId = parseInt(decoded.userId.toString());
    if (userId !== -99) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    // Send reminders
    await sendAppointmentReminders();

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
    });
  } catch (error) {
    console.error(
      "Error in POST /api/admin/game-appointments/send-reminders:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
