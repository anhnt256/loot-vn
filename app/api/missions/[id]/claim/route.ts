import { NextResponse } from "next/server";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { getCurrentDateVN, getVNTimeForPrisma, getVNStartOfDayForPrisma } from "@/lib/timezone-utils";
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
    const branch = cookieStore.get("branch")?.value || "GO_VAP";

    // Get mission details
    const mission = await db.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Check if mission is currently active
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const currentHour = now.hour();
    const { startHours, endHours } = mission;

    const isMissionActive = () => {
      // All day missions are always active
      if (startHours === 0 && endHours === 23) return true;

      // Handle overnight missions (e.g., 22-6)
      if (startHours > endHours) {
        return currentHour >= startHours || currentHour <= endHours;
      }

      // Normal time range
      return currentHour >= startHours && currentHour <= endHours;
    };

    if (!isMissionActive()) {
      return NextResponse.json(
        { error: "Mission is not active at this time" },
        { status: 400 },
      );
    }

    // Check if user already completed this mission today
    const today = getVNStartOfDayForPrisma();

    const existingCompletion = await db.userMissionCompletion.findFirst({
      where: {
        userId: userId,
        missionId: missionId,
        branch: branch,
        createdAt: {
          gte: today,
        },
      },
    });

    if (existingCompletion) {
      return NextResponse.json(
        { error: "Mission already completed today" },
        { status: 400 },
      );
    }

    // Get user data from fnet database
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    // Get today's date in fnet format
    const todayDate = getCurrentDateVN();
    const yyyy = todayDate.getFullYear();
    const mm = String(todayDate.getMonth() + 1).padStart(2, "0");
    const dd = String(todayDate.getDate()).padStart(2, "0");
    const curDate = `${yyyy}-${mm}-${dd}`;

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
    console.log("[DEBUG] Creating completion record:", {
      userId,
      missionId,
      branch,
      completedAt: getVNTimeForPrisma(),
      createdAt: getVNTimeForPrisma(),
      actualValue,
    });

    const completion = await db.$transaction(async (tx) => {
      const completion = await tx.userMissionCompletion.create({
        data: {
          userId: userId,
          missionId: missionId,
          branch: branch,
          completedAt: getVNTimeForPrisma(),
          actualValue: actualValue,
          createdAt: getVNTimeForPrisma(),
        },
      });

      return completion;
    });

    // Add XP to user's battle pass progress
    const currentSeason = await db.battlePassSeason.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: getVNTimeForPrisma(),
        },
        endDate: {
          gte: getVNTimeForPrisma(),
        },
      },
    });

    if (currentSeason) {
      // Find or create user battle pass progress
      let userProgress = await db.userBattlePass.findFirst({
        where: {
          userId: userId,
          seasonId: currentSeason.id,
        },
      });

      if (!userProgress) {
        userProgress = await db.userBattlePass.create({
          data: {
            userId: userId,
            seasonId: currentSeason.id,
            branch: branch,
            experience: 0,
            level: 1,
            isPremium: false,
          },
        });
      }

      // Add XP from mission completion
      await db.userBattlePass.update({
        where: { id: userProgress.id },
        data: {
          experience: {
            increment: mission.reward,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Mission completed successfully",
      xpReward: mission.reward,
      completion: completion,
    });
  } catch (error) {
    console.error("Error claiming mission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
