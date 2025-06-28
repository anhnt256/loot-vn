import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== TEST SYNC API START ===');
    
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

    // Test with a hardcoded user ID
    const testUserId = 1;
    
    // Find or create user progress
    console.log('Finding user progress for user ID:', testUserId);
    let userProgress = await db.userBattlePass.findFirst({
      where: {
        userId: testUserId,
        seasonId: currentSeason.id,
      },
    });

    console.log('Existing user progress:', userProgress);

    if (!userProgress) {
      console.log('Creating new user progress...');
      // Create new user progress
      userProgress = await db.userBattlePass.create({
        data: {
          userId: testUserId,
          seasonId: currentSeason.id,
          level: 1,
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
      season: currentSeason,
      userProgress: userProgress,
    };

    console.log('Response:', response);
    console.log('=== TEST SYNC API END ===');

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in test sync:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 