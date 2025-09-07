import { NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import {
  getCurrentTimeVNISO,
  getStartOfDayVNISO,
  getCurrentDateVNString,
} from "@/lib/timezone-utils";
import {
  calculateDailyUsageHours,
  calculateMissionUsageHours,
} from "@/lib/battle-pass-utils";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get("user");

    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 401 });
    }

    const userId = parseInt(decoded.userId);
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    // Get all missions using raw SQL
    const missions = await db.$queryRaw<any[]>`
      SELECT * FROM Mission ORDER BY id ASC
    `;

    // Get today's date in fnet format using ISO function
    const curDate = getCurrentDateVNString();

    // Get fnet database connection
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    // Get today's start for completion check using ISO function
    const todayStartISO = getStartOfDayVNISO();

    // Get user's completion records for today using raw SQL
    const userCompletions = await db.$queryRaw<any[]>`
      SELECT * FROM UserMissionCompletion 
      WHERE userId = ${userId} 
        AND branch = ${branch} 
        AND createdAt >= ${todayStartISO}
    `;

    // Create a map of completed mission IDs
    const completedMissionIds = new Set(
      userCompletions.map((c) => c.missionId),
    );

    // console.log("completedMissionIds", completedMissionIds);

    // Get play sessions for the entire day and overnight sessions from previous day
    let playSessions: any[] = [];
    try {
      playSessions = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
        SELECT *
        FROM fnet.systemlogtb
        WHERE UserId = ${userId}
          AND status = 3
          AND (
            EnterDate = ${curDate} 
            OR EndDate = ${curDate}
            OR (EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY) AND EndDate = ${curDate})
            OR (EndDate IS NULL AND EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY))
          )
        LIMIT 1000
      `);
    } catch (error) {
      console.error("Error fetching play sessions:", error);
      playSessions = []; // Fallback to empty array
    }

    // Get ORDER and TOPUP data for the entire day
    let orderProgress = 0;
    let topupProgress = 0;

    try {
      const orderPayments = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
        SELECT COALESCE(CAST(SUM(ABS(AutoAmount)) AS DECIMAL(18,2)), 0) AS total
        FROM fnet.paymenttb
        WHERE PaymentType = 4
          AND UserId = ${userId}
          AND Note LIKE N'%Thời gian phí (cấn trừ từ ffood%'
          AND ServeDate = ${curDate}
      `);
      orderProgress = parseFloat(orderPayments[0]?.total?.toString() || "0");

      const topupPayments = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
        SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
        FROM fnet.paymenttb
        WHERE PaymentType = 4
          AND UserId = ${userId}
          AND Note NOT LIKE N'%Thời gian phí (cấn trừ từ ffood%'
          AND ServeDate = ${curDate}
      `);
      topupProgress = parseFloat(topupPayments[0]?.total?.toString() || "0");
    } catch (error) {
      console.error("Error fetching payment data:", error);
      // Keep default values (0)
    }

    // Enhance missions with user progress and completion status
    const missionsWithProgress = missions.map((mission) => {
      const isCompleted = completedMissionIds.has(mission.id);

      // Get actual progress based on mission type
      let actualValue = 0;
      switch (mission.type) {
        case "HOURS":
          // Calculate hours progress for this specific mission's time range
          actualValue = calculateMissionUsageHours(
            playSessions,
            curDate,
            mission.startHours,
            mission.endHours,
          );
          break;
        case "ORDER":
          actualValue = orderProgress;
          break;
        case "TOPUP":
          actualValue = topupProgress;
          break;
      }

      // Check if mission can be claimed
      const canClaim = !isCompleted && actualValue >= mission.quantity;

      return {
        ...mission,
        userCompletion: isCompleted
          ? {
              id:
                userCompletions.find((c) => c.missionId === mission.id)?.id ||
                0,
              isDone: true,
              createdAt:
                userCompletions.find((c) => c.missionId === mission.id)
                  ?.createdAt || new Date(),
              updatedAt:
                userCompletions.find((c) => c.missionId === mission.id)
                  ?.updatedAt || new Date(),
            }
          : null,
        progress: {
          actual: actualValue,
          required: mission.quantity,
          percentage: Math.min((actualValue / mission.quantity) * 100, 100),
          canClaim: canClaim,
        },
      };
    });

    return NextResponse.json(missionsWithProgress);
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
