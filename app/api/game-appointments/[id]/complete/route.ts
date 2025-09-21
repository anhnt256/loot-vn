import { NextRequest, NextResponse } from "next/server";
import { completeGameAppointmentAction } from "@/actions/complete-game-appointment";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Add appointmentId from URL params
    const data = {
      ...body,
      appointmentId: params.id
    };
    
    // Validate and complete appointment (action will get user info from cookies)
    const result = await completeGameAppointmentAction(data);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error("Error in POST /api/game-appointments/[id]/complete:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
