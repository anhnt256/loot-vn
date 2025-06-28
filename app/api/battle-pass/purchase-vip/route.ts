import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateLevel } from '@/lib/battle-pass-utils';

export async function POST(request: Request) {
  try {
    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get('user');
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
    }

    const body = await request.json();
    const { duration } = body;

    if (!duration || typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json(
        { error: 'Invalid duration' },
        { status: 400 }
      );
    }

    const currentSeason = await db.battlePassSeason.findFirst({
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
    const userProgress = await db.userBattlePass.upsert({
      where: {
        userId_seasonId: {
          userId: decoded.userId,
          seasonId: currentSeason.id,
        },
      },
      update: {
        isPremium: true,
      },
      create: {
        userId: decoded.userId,
        seasonId: currentSeason.id,
        level: calculateLevel(0, currentSeason.maxLevel), // Level 1 cho user mới (0 experience)
        experience: 0,
        isPremium: true,
        totalSpent: 0,
        branch: 'GO_VAP',
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