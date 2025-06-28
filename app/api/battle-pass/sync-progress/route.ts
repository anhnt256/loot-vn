import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    console.log('=== SYNC PROGRESS API START ===');
    
    // Get user info from headers (set by middleware)
    const userHeader = request.headers.get('user');
    console.log('User header:', userHeader);
    
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);
    console.log('Decoded user:', decoded);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
    }

    // Get current active season
    console.log('Getting current season...');
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

    console.log('Current season:', currentSeason);

    if (!currentSeason) {
      return NextResponse.json(
        { error: 'No active season found' },
        { status: 404 }
      );
    }

    // Find user progress
    console.log('Finding user progress...');
    let userProgress = await db.userBattlePass.findFirst({
      where: {
        userId: decoded.userId,
        seasonId: currentSeason.id,
      },
    });

    console.log('Existing user progress:', userProgress);

    if (!userProgress) {
      console.log('Creating new user progress...');
      // Create new user progress with default values
      userProgress = await db.userBattlePass.create({
        data: {
          userId: decoded.userId,
          seasonId: currentSeason.id,
          level: 0,
          experience: 0,
          isPremium: false,
          totalSpent: 0,
          branch: 'GO_VAP',
        },
      });
      console.log('Created user progress:', userProgress);
    }

    const response = {
      success: true,
      experience: userProgress.experience,
      level: userProgress.level,
      totalSpent: userProgress.totalSpent,
    };

    console.log('Response:', response);
    console.log('=== SYNC PROGRESS API END ===');

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error syncing battle pass progress:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 