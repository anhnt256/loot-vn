import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { duration } = body;

    if (!duration || typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json(
        { error: 'Invalid duration' },
        { status: 400 }
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

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    // Update or create user progress
    const userProgress = await prisma.userBattlePassProgress.upsert({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: currentSeason.id,
        },
      },
      update: {
        isVip: true,
      },
      create: {
        userId: session.user.id,
        seasonId: currentSeason.id,
        isVip: true,
        totalPlayTime: 0,
        totalFoodSpending: 0,
        totalDrinkSpending: 0,
        claimedRewards: [],
      },
    });

    return NextResponse.json({
      success: true,
      expiryDate,
    });
  } catch (error) {
    console.error('Error purchasing VIP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 