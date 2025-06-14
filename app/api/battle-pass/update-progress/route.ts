import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFnetDB } from '@/lib/db';
import dayjs from 'dayjs';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const fnetDB = await getFnetDB();
    const userId = session.user.id;

    // Get current active season
    const currentSeason = await prisma.battlePassSeason.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (!currentSeason) {
      return NextResponse.json(
        { error: 'No active season found' },
        { status: 404 }
      );
    }

    // Get user's play time from systemlogtb
    const query = `
      SELECT *
      FROM fnet.systemlogtb AS t1
      WHERE t1.UserId = ${userId}
        AND t1.status = 3
        AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) = CURDATE()

      UNION ALL

      SELECT *
      FROM (
        SELECT *
        FROM fnet.systemlogtb AS t1
        WHERE t1.UserId = ${userId}
          AND t1.status = 3
          AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) < CURDATE()
        ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
        LIMIT 1
      ) AS t2`;

    const result = await fnetDB.$queryRaw<any[]>(query);

    // Calculate total play time in minutes
    const totalTimeUsed = result.reduce((sum, item) => sum + item.TimeUsed, 0);
    const totalPlayTime = Math.floor(totalTimeUsed / 60);

    // Update or create user progress
    const userProgress = await prisma.userBattlePassProgress.upsert({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: currentSeason.id,
        },
      },
      update: {
        totalPlayTime,
      },
      create: {
        userId: session.user.id,
        seasonId: currentSeason.id,
        totalPlayTime,
        totalFoodSpending: 0,
        totalDrinkSpending: 0,
        claimedRewards: [],
        isVip: false,
      },
    });

    return NextResponse.json({
      success: true,
      totalPlayTime,
    });
  } catch (error) {
    console.error('Error updating battle pass progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 