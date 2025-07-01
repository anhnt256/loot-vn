import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { rewardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rewardId = parseInt(params.rewardId);
    if (isNaN(rewardId)) {
      return NextResponse.json(
        { error: 'Invalid reward ID' },
        { status: 400 }
      );
    }

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

    // Get the reward
    const reward = currentSeason.rewards.find(r => r.id === rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    // Get user progress
    const userProgress = await prisma.userBattlePassProgress.findUnique({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: currentSeason.id,
        },
      },
    });

    if (!userProgress) {
      return NextResponse.json(
        { error: 'No progress found for this season' },
        { status: 404 }
      );
    }

    // Check if reward is already claimed
    if (userProgress.claimedRewards.includes(rewardId)) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 }
      );
    }

    // Check if user meets requirements
    const meetsRequirements = (() => {
      switch (reward.requirements.type) {
        case 'PLAY_TIME':
          return userProgress.totalPlayTime >= reward.requirements.amount;
        case 'FOOD_SPENDING':
          return userProgress.totalFoodSpending >= reward.requirements.amount;
        case 'DRINK_SPENDING':
          return userProgress.totalDrinkSpending >= reward.requirements.amount;
        default:
          return false;
      }
    })();

    if (!meetsRequirements) {
      return NextResponse.json(
        { error: 'Requirements not met' },
        { status: 400 }
      );
    }

    // Check if reward is VIP-only
    if (reward.isVipOnly && !userProgress.isVip) {
      return NextResponse.json(
        { error: 'VIP required for this reward' },
        { status: 403 }
      );
    }

    // Update user progress with claimed reward
    const updatedProgress = await prisma.userBattlePassProgress.update({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: currentSeason.id,
        },
      },
      data: {
        claimedRewards: {
          push: rewardId,
        },
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