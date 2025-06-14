import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    const userProgress = await prisma.userBattlePassProgress.findFirst({
      where: {
        userId: session.user.id,
        seasonId: currentSeason.id,
      },
    });

    const availableRewards = await prisma.battlePassReward.findMany({
      where: {
        seasonId: currentSeason.id,
        id: {
          notIn: userProgress?.claimedRewards as number[] || [],
        },
      },
      orderBy: {
        level: 'asc',
      },
    });

    return NextResponse.json({
      seasonId: currentSeason.id,
      isVip: userProgress?.isVip || false,
      totalPlayTime: userProgress?.totalPlayTime || 0,
      totalFoodSpending: userProgress?.totalFoodSpending || 0,
      totalDrinkSpending: userProgress?.totalDrinkSpending || 0,
      claimedRewards: userProgress?.claimedRewards || [],
      availableRewards,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 