import { NextRequest, NextResponse } from "next/server";
import { batchUpdateAppointmentTiers } from '@/lib/auto-tier-downgrade';
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

    // Check if user is admin (userId -99 is admin)
    const userId = parseInt(decoded.userId);
    if (userId !== -99) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Run batch update
    const result = await batchUpdateAppointmentTiers();

    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error("Error in POST /api/admin/game-appointments/batch-update-tiers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
