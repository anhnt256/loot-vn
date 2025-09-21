import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET(
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

    const appointmentId = params.id;

    // Get appointment with members and tier
    const appointment = await db.gameAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        members: true,
        tier: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    // Format the response
    const formattedAppointment = {
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      game: appointment.game,
      gameType: appointment.gameType,
      rankLevel: appointment.rankLevel,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      minMembers: appointment.minMembers,
      maxMembers: appointment.maxMembers,
      minCost: Number(appointment.minCost),
      currentMembers: appointment.currentMembers,
      status: appointment.status,
      tier: appointment.tier?.tierName || null,
      totalLockedAmount: Number(appointment.totalLockedAmount),
      createdAt: appointment.createdAt.toISOString(),
      members: appointment.members.map(member => ({
        id: member.id,
        userId: member.userId,
        status: member.status,
        joinedAt: member.joinedAt.toISOString()
      })),
      promotion: appointment.tier ? {
        promotion: appointment.tier.promotion,
        description: appointment.tier.description,
        businessLogic: appointment.tier.businessLogic,
        minNetProfit: Number(appointment.tier.minNetProfit)
      } : null
    };

    return NextResponse.json({ success: true, data: formattedAppointment });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
