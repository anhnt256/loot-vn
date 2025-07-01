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

    // Get user's food and drink spending from systemlogtb
    const query = `
      SELECT 
        SUM(CASE WHEN action_name = 'Số tiền thanh toán đơn hàng tại cửa hàng' THEN CAST(spent_sum AS DECIMAL(10,2)) ELSE 0 END) as total_spending
      FROM fnet.systemlogtb
      WHERE UserId = ${userId}
        AND DATE(STR_TO_DATE(CONCAT(EnterDate, ' ', EnterTime), '%Y-%m-%d %H:%i:%s')) >= '${currentSeason.startDate.toISOString().split('T')[0]}'
        AND DATE(STR_TO_DATE(CONCAT(EnterDate, ' ', EnterTime), '%Y-%m-%d %H:%i:%s')) <= '${currentSeason.endDate.toISOString().split('T')[0]}'
    `;

    const result = await fnetDB.$queryRaw<any[]>(query);
    const totalSpending = result[0]?.total_spending || 0;

    // For now, we'll split the spending 50/50 between food and drinks
    // In a real implementation, you would want to categorize the spending based on item types
    const foodSpending = Math.floor(totalSpending * 0.5);
    const drinkSpending = Math.floor(totalSpending * 0.5);

    // Update or create user progress
    const userProgress = await prisma.userBattlePassProgress.upsert({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: currentSeason.id,
        },
      },
      update: {
        totalFoodSpending: foodSpending,
        totalDrinkSpending: drinkSpending,
      },
      create: {
        userId: session.user.id,
        seasonId: currentSeason.id,
        totalPlayTime: 0,
        totalFoodSpending: foodSpending,
        totalDrinkSpending: drinkSpending,
        claimedRewards: [],
        isVip: false,
      },
    });

    return NextResponse.json({
      success: true,
      foodSpending,
      drinkSpending,
    });
  } catch (error) {
    console.error('Error updating battle pass spending:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 