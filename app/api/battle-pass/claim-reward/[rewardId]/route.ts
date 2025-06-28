import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { rewardId: string } }
) {
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

    const rewardId = parseInt(params.rewardId);
    if (isNaN(rewardId)) {
      return NextResponse.json(
        { error: 'Invalid reward ID' },
        { status: 400 }
      );
    }

    // Get current active season
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
      include: {
        rewards: true,
      },
    });

    if (!currentSeason) {
      return NextResponse.json(
        { error: 'No active season found' },
        { status: 404 }
      );
    }

    // Double check - ensure season hasn't ended
    if (new Date() >= new Date(currentSeason.endDate)) {
      return NextResponse.json(
        { error: 'Season has ended - cannot claim rewards' },
        { status: 403 }
      );
    }

    // Get the reward
    const reward = currentSeason.rewards.find(r => r.id === rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    // Get user progress
    const userProgress = await db.userBattlePass.findFirst({
      where: {
        userId: decoded.userId,
        seasonId: currentSeason.id,
      },
    });

    if (!userProgress) {
      return NextResponse.json(
        { error: 'No progress found for this season' },
        { status: 404 }
      );
    }

    // Check if reward is already claimed
    const claimedReward = await db.userBattlePassReward.findFirst({
      where: {
        userId: decoded.userId,
        rewardId: rewardId,
      },
    });

    if (claimedReward) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 }
      );
    }

    // Check if user meets XP requirement
    if (userProgress.experience < reward.experience) {
      return NextResponse.json(
        { error: `Not enough XP to claim this reward. Required: ${reward.experience}, Current: ${userProgress.experience}` },
        { status: 400 }
      );
    }

    // Check if reward is VIP-only (premium type)
    if (reward.type === 'premium' && !userProgress.isPremium) {
      return NextResponse.json(
        { error: 'Premium required for this reward' },
        { status: 403 }
      );
    }

    // Create claimed reward record
    await db.userBattlePassReward.create({
      data: {
        userId: decoded.userId,
        seasonId: currentSeason.id,
        rewardId: rewardId,
      },
    });

    // TODO: Implement actual reward distribution logic here
    // This could involve:
    // - Adding items to user inventory
    // - Adding currency to user balance
    // - Unlocking special features
    // - etc.

    return NextResponse.json({
      success: true,
      message: 'Reward claimed successfully',
      reward,
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 