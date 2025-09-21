import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManualActivationOptions } from '@/lib/auto-tier-downgrade';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get("user");
    if (!userHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = JSON.parse(userHeader);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid user data" },
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

    // Get manual activation options
    const options = await getManualActivationOptions(params.id);

    return NextResponse.json({
      success: true,
      data: options
    });
    
  } catch (error) {
    console.error("Error in GET /api/admin/game-appointments/[id]/activate-tier:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get("user");
    if (!userHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = JSON.parse(userHeader);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid user data" },
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

    const body = await request.json();
    const { tierName } = body;

    if (!tierName) {
      return NextResponse.json(
        { success: false, error: "Tier name is required" },
        { status: 400 }
      );
    }

    // Check if appointment exists
    const appointment = await db.gameAppointment.findUnique({
      where: { id: params.id },
      include: { tier: true }
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if tier exists and is active
    const tier = await db.gameAppointmentTier.findUnique({
      where: { tierName }
    });

    if (!tier || !tier.isActive) {
      return NextResponse.json(
        { success: false, error: "Tier not found or inactive" },
        { status: 400 }
      );
    }

    // Update appointment with manual tier
    const updatedAppointment = await db.gameAppointment.update({
      where: { id: params.id },
      data: {
        tierId: tier.id
      },
      include: { tier: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        appointmentId: updatedAppointment.id,
        tier: updatedAppointment.tier ? {
          tierName: updatedAppointment.tier.tierName,
          questName: updatedAppointment.tier.questName,
          minMembers: updatedAppointment.tier.minMembers,
          maxMembers: updatedAppointment.tier.maxMembers,
          minHours: updatedAppointment.tier.minHours,
          lockedAmount: updatedAppointment.tier.lockedAmount,
          tasks: updatedAppointment.tier.tasks
        } : null
      }
    });
    
  } catch (error) {
    console.error("Error in POST /api/admin/game-appointments/[id]/activate-tier:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
