import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      targetAudience,
      conditions,
      rules,
      budget,
      expectedParticipants,
      createdBy,
    } = body;

    // Validate required fields
    if (!name || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Name, type, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 },
      );
    }

    // Generate CUID-like ID
    const generateCuid = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = randomBytes(12)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 16);
      return `${timestamp}${randomStr}`;
    };

    const eventId = generateCuid();
    const now = getCurrentTimeVNDB();

    // Create event
    await db.$executeRaw`
      INSERT INTO Event (
        id, name, description, type, status, startDate, endDate, 
        registrationStart, registrationEnd, targetAudience, 
        conditions, rules, budget, expectedParticipants, 
        createdBy, branch, isActive, createdAt, updatedAt
      )
      VALUES (
        ${eventId},
        ${name},
        ${description || null},
        ${type},
        'DRAFT',
        ${start},
        ${end},
        ${registrationStart ? new Date(registrationStart) : null},
        ${registrationEnd ? new Date(registrationEnd) : null},
        ${targetAudience ? JSON.stringify(targetAudience) : null},
        ${conditions ? JSON.stringify(conditions) : null},
        ${rules ? JSON.stringify(rules) : null},
        ${budget || null},
        ${expectedParticipants || null},
        ${createdBy || null},
        ${branch},
        true,
        ${now},
        ${now}
      )
    `;

    // Get the created event
    const createdEvent = await db.$queryRaw<any[]>`
      SELECT * FROM Event 
      WHERE id = ${eventId}
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      event: {
        ...createdEvent[0],
        id: createdEvent[0].id.toString(),
        budget: createdEvent[0].budget
          ? createdEvent[0].budget.toString()
          : null,
        expectedParticipants: createdEvent[0].expectedParticipants
          ? createdEvent[0].expectedParticipants.toString()
          : null,
        totalParticipants: createdEvent[0].totalParticipants.toString(),
        totalCodesGenerated: createdEvent[0].totalCodesGenerated.toString(),
        totalCodesUsed: createdEvent[0].totalCodesUsed.toString(),
        totalRewardsDistributed:
          createdEvent[0].totalRewardsDistributed.toString(),
        createdAt: createdEvent[0].createdAt.toISOString(),
        updatedAt: createdEvent[0].updatedAt.toISOString(),
        startDate: createdEvent[0].startDate.toISOString(),
        endDate: createdEvent[0].endDate.toISOString(),
        registrationStart: createdEvent[0].registrationStart
          ? createdEvent[0].registrationStart.toISOString()
          : null,
        registrationEnd: createdEvent[0].registrationEnd
          ? createdEvent[0].registrationEnd.toISOString()
          : null,
        approvedAt: createdEvent[0].approvedAt
          ? createdEvent[0].approvedAt.toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error("[EVENT_CREATE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const events = await db.$queryRaw<any[]>`
      SELECT * FROM Event 
      WHERE (branch = ${branch} OR branch = 'ALL') AND isActive = true
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalCount = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM Event 
      WHERE (branch = ${branch} OR branch = 'ALL') AND isActive = true
    `;

    // Convert BigInt to string for JSON serialization
    const serializedEvents = events.map((event) => ({
      ...event,
      id: event.id.toString(),
      budget: event.budget ? event.budget.toString() : null,
      expectedParticipants: event.expectedParticipants
        ? event.expectedParticipants.toString()
        : null,
      totalParticipants: event.totalParticipants.toString(),
      totalCodesGenerated: event.totalCodesGenerated.toString(),
      totalCodesUsed: event.totalCodesUsed.toString(),
      totalRewardsDistributed: event.totalRewardsDistributed.toString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      registrationStart: event.registrationStart
        ? event.registrationStart.toISOString()
        : null,
      registrationEnd: event.registrationEnd
        ? event.registrationEnd.toISOString()
        : null,
      approvedAt: event.approvedAt ? event.approvedAt.toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      events: serializedEvents,
      totalCount: totalCount[0].count.toString(),
      pagination: {
        limit,
        offset,
        hasMore: events.length === limit,
      },
    });
  } catch (error) {
    console.error("[EVENT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
