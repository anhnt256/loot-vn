import { NextRequest, NextResponse } from "next/server";
import { createGameAppointmentAction } from "@/actions/create-game-appointment";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate and create appointment (action will get user info from cookies)
    const result = await createGameAppointmentAction(body);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/game-appointments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    const branch = cookieStore.get("branch")?.value || "GO_VAP";
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const game = searchParams.get("game");
    const tier = searchParams.get("tier");

    // Build where clause
    const where: any = { branch };

    if (status) {
      where.status = status;
    }

    if (game) {
      where.game = { contains: game };
    }

    if (tier) {
      where.tier = {
        tierName: tier,
      };
    }

    // Get appointments with pagination
    const [appointments, total] = await Promise.all([
      db.gameAppointment.findMany({
        where,
        include: {
          members: {
            select: {
              id: true,
              userId: true,
              status: true,
              joinedAt: true,
            },
          },
          tier: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.gameAppointment.count({ where }),
    ]);

    // Format response
    const formattedAppointments = appointments.map((appointment) => {
      return {
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
        minCost: appointment.minCost,
        currentMembers: appointment.currentMembers,
        status: appointment.status,
        tierId: appointment.tierId,
        totalLockedAmount: appointment.totalLockedAmount,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
        members: appointment.members,
        tier: appointment.tier
          ? {
              tierName: appointment.tier.tierName,
              questName: appointment.tier.questName,
              minMembers: appointment.tier.minMembers,
              maxMembers: appointment.tier.maxMembers,
              minHours: appointment.tier.minHours,
              lockedAmount: appointment.tier.lockedAmount,
              tasks: appointment.tier.tasks,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in GET /api/game-appointments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
