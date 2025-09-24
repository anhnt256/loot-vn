import { NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { Prisma } from "@/prisma/generated/prisma-client";
import {
  getCurrentTimeVNISO,
  getCurrentTimeVNDB,
  getStartOfDayVNISO,
  getCurrentDateVNString,
} from "@/lib/timezone-utils";
import { calculateMissionUsageHours } from "@/lib/battle-pass-utils";
import dayjs from "@/lib/dayjs";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
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

    const missionId = parseInt(params.id);
    if (isNaN(missionId)) {
      return NextResponse.json(
        { error: "Invalid mission ID" },
        { status: 400 },
      );
    }

    const userId = parseInt(decoded.userId);
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    // Get mission details
    const mission = await db.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // // Check if mission is currently active
    // const now = dayjs().tz("Asia/Ho_Chi_Minh");
    // const currentHour = now.hour();
    // const { startHours, endHours } = mission;

    // const isMissionActive = () => {
    //   // All day missions are always active
    //   if (startHours === 0 && endHours === 23) return true;

    //   // Handle overnight missions (e.g., 22-6)
    //   if (startHours > endHours) {
    //     return currentHour >= startHours || currentHour <= endHours;
    //   }

    //   // Normal time range
    //   return currentHour >= startHours && currentHour <= endHours;
    // };

    // if (!isMissionActive()) {
    //   return NextResponse.json(
    //     { error: "Mission is not active at this time" },
    //     { status: 400 },
    //   );
    // }

    // Check if user already completed this mission today
    const today = getStartOfDayVNISO();

    const existingCompletion = await db.$queryRaw<any[]>(Prisma.sql`
      SELECT * FROM UserMissionCompletion 
      WHERE userId = ${userId} 
        AND missionId = ${missionId} 
        AND branch = ${branch} 
        AND createdAt >= ${today}
    `);

    if (existingCompletion && existingCompletion.length > 0) {
      return NextResponse.json(
        { error: "Mission already completed today" },
        { status: 400 },
      );
    }

    // Get user data from fnet database
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    // Get today's date in fnet format
    const curDate = getCurrentDateVNString();

    console.log("curDate", curDate);

    let missionCompleted = false;
    let actualValue = 0;

    // Check different mission types
    switch (mission.type) {
      case "HOURS": {
        // Get play sessions from fnet including overnight sessions
        const playSessions = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
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
        `);

        // Calculate hours progress for this specific mission's time range
        actualValue = calculateMissionUsageHours(
          playSessions,
          curDate,
          mission.startHours,
          mission.endHours,
        );

        console.log("actualValue", actualValue);
        console.log("mission.quantity", mission.quantity);

        missionCompleted = actualValue >= mission.quantity;
        break;
      }

      case "ORDER": {
        // Get order payments from fnet (Thời gian phí - cấn trừ từ ffood)
        const orderPayments = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
          SELECT COALESCE(CAST(SUM(ABS(AutoAmount)) AS DECIMAL(18,2)), 0) AS total
          FROM fnet.paymenttb
          WHERE PaymentType = 4
            AND UserId = ${userId}
            AND Note LIKE N'%Thời gian phí (cấn trừ từ ffood%'
            AND ServeDate = ${curDate}
        `);

        const totalOrderAmount = parseFloat(
          orderPayments[0]?.total?.toString() || "0",
        );
        actualValue = totalOrderAmount;
        missionCompleted = totalOrderAmount >= mission.quantity;
        break;
      }

      case "TOPUP": {
        // Get top-up payments from fnet (tất cả trừ Thời gian phí - cấn trừ từ ffood)
        const topupPayments = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
          SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
          FROM fnet.paymenttb
          WHERE PaymentType = 4
            AND UserId = ${userId}
            AND Note NOT LIKE N'%Thời gian phí (cấn trừ từ ffood%'
            AND ServeDate = ${curDate}
        `);

        const totalTopupAmount = parseFloat(
          topupPayments[0]?.total?.toString() || "0",
        );
        actualValue = totalTopupAmount;
        missionCompleted = totalTopupAmount >= mission.quantity;
        break;
      }

      default:
        return NextResponse.json(
          { error: "Unsupported mission type" },
          { status: 400 },
        );
    }

    if (!missionCompleted) {
      return NextResponse.json(
        {
          error: "Mission requirements not met",
          required: mission.quantity,
          actual: actualValue,
          type: mission.type,
        },
        { status: 400 },
      );
    }

    // Create mission completion record within transaction
    const currentTime = getCurrentTimeVNDB();
    console.log("[DEBUG] Creating completion record:", {
      userId,
      missionId,
      branch,
      completedAt: currentTime,
      createdAt: currentTime,
      actualValue,
    });

    const completion = await db.$queryRaw<any[]>(Prisma.sql`
      INSERT INTO UserMissionCompletion (userId, missionId, branch, completedAt, actualValue, createdAt, updatedAt)
      VALUES (${userId}, ${missionId}, ${branch}, ${currentTime}, ${actualValue}, ${currentTime}, ${currentTime})
    `);

    // Add XP to user's battle pass progress
    const currentSeason = await db.$queryRaw<any[]>(Prisma.sql`
      SELECT * FROM BattlePassSeason 
      WHERE isActive = true 
        AND startDate <= ${currentTime} 
        AND endDate >= ${currentTime}
      LIMIT 1
    `);

    if (currentSeason && currentSeason.length > 0) {
      const season = currentSeason[0];
      // Find or create user battle pass progress
      let userProgress = await db.$queryRaw<any[]>(Prisma.sql`
        SELECT * FROM UserBattlePass 
        WHERE userId = ${userId} 
          AND seasonId = ${season.id}
          AND branch = ${branch}
      `);

      if (!userProgress || userProgress.length === 0) {
        await db.$queryRaw(Prisma.sql`
          INSERT INTO UserBattlePass (userId, seasonId, branch, experience, level, isPremium)
          VALUES (${userId}, ${season.id}, ${branch}, 0, 1, false)
        `);
        userProgress = await db.$queryRaw<any[]>(Prisma.sql`
          SELECT * FROM UserBattlePass 
          WHERE userId = ${userId} 
            AND seasonId = ${season.id}
            AND branch = ${branch}
        `);
      }

      // Add XP from mission completion
      const progress = userProgress[0];
      await db.$queryRaw(Prisma.sql`
        UPDATE UserBattlePass 
        SET experience = experience + ${mission.reward}
        WHERE id = ${progress.id}
      `);
    }

    return NextResponse.json({
      success: true,
      message: "Mission completed successfully",
      xpReward: mission.reward,
      completion: { id: "created" },
    });
  } catch (error) {
    console.error("Error claiming mission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
