import { db } from './db';

const prisma = db;

export interface RewardDistributionResult {
  success: boolean;
  distributedRewards: Array<{
    userId: number;
    rewardType: string;
    rewardValue: string;
    quantity: number;
    status: string;
  }>;
  totalRewardsDistributed: number;
  error?: string;
}

export interface AppointmentCompletionData {
  appointmentId: string;
  completedMembers: Array<{
    userId: number;
    lockedAmount: number;
    status: 'COMPLETED' | 'NO_SHOW';
  }>;
  tier?: string;
  promotion?: any;
  totalLockedAmount: number;
}

/**
 * Distribute rewards for completed appointment
 */
export async function distributeAppointmentRewards(
  completionData: AppointmentCompletionData
): Promise<RewardDistributionResult> {
  try {
    const { appointmentId, completedMembers, tier, promotion, totalLockedAmount } = completionData;

    // Get appointment details
    const appointment = await prisma.gameAppointment.findUnique({
      where: { id: appointmentId },
      include: { tierConfig: true }
    });

    if (!appointment) {
      return {
        success: false,
        distributedRewards: [],
        totalRewardsDistributed: 0,
        error: 'Appointment not found'
      };
    }

    // Get tier configuration
    const tierConfig = appointment.tierConfig;
    if (!tierConfig || !tier) {
      return {
        success: false,
        distributedRewards: [],
        totalRewardsDistributed: 0,
        error: 'No tier configuration found'
      };
    }

    const rewards = tierConfig.rewards as any;
    const distributedRewards = [];

    // Distribute base rewards to all completed members
    for (const member of completedMembers.filter(m => m.status === 'COMPLETED')) {
      // Distribute base rewards
      if (rewards.baseRewards) {
        for (const baseReward of rewards.baseRewards) {
          const reward = await prisma.gameAppointmentReward.create({
            data: {
              appointmentId,
              userId: member.userId,
              branch: appointment.branch,
              rewardType: baseReward.type,
              rewardValue: baseReward.value,
              quantity: baseReward.quantity,
              status: 'DISTRIBUTED'
            }
          });

          distributedRewards.push({
            userId: member.userId,
            rewardType: baseReward.type,
            rewardValue: baseReward.value,
            quantity: baseReward.quantity,
            status: 'DISTRIBUTED'
          });
        }
      }

      // Distribute time-based rewards
      if (rewards.timeBasedRewards) {
        const hours = Math.ceil((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60 * 60));
        
        for (const timeReward of rewards.timeBasedRewards) {
          if (hours >= timeReward.minHours) {
            const reward = await prisma.gameAppointmentReward.create({
              data: {
                appointmentId,
                userId: member.userId,
                branch: appointment.branch,
                rewardType: timeReward.type,
                rewardValue: timeReward.value,
                quantity: timeReward.quantity,
                status: 'DISTRIBUTED'
              }
            });

            distributedRewards.push({
              userId: member.userId,
              rewardType: timeReward.type,
              rewardValue: timeReward.value,
              quantity: timeReward.quantity,
              status: 'DISTRIBUTED'
            });
          }
        }
      }

      // Distribute member-count based rewards
      if (rewards.memberCountRewards) {
        const completedMemberCount = completedMembers.filter(m => m.status === 'COMPLETED').length;
        
        for (const memberReward of rewards.memberCountRewards) {
          if (completedMemberCount >= memberReward.minMembers) {
            const reward = await prisma.gameAppointmentReward.create({
              data: {
                appointmentId,
                userId: member.userId,
                branch: appointment.branch,
                rewardType: memberReward.type,
                rewardValue: memberReward.value,
                quantity: memberReward.quantity,
                status: 'DISTRIBUTED'
              }
            });

            distributedRewards.push({
              userId: member.userId,
              rewardType: memberReward.type,
              rewardValue: memberReward.value,
              quantity: memberReward.quantity,
              status: 'DISTRIBUTED'
            });
          }
        }
      }
    }

    // Handle no-show members (forfeit locked amount to Gateway fund)
    const noShowMembers = completedMembers.filter(m => m.status === 'NO_SHOW');
    let forfeitedAmount = 0;

    for (const member of noShowMembers) {
      forfeitedAmount += member.lockedAmount;
      
      // Update member status
      await prisma.gameAppointmentMember.updateMany({
        where: {
          appointmentId,
          userId: member.userId
        },
        data: {
          status: 'NO_SHOW'
        }
      });
    }

    // Update appointment status
    await prisma.gameAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'COMPLETED'
      }
    });

    // Log forfeited amount to Gateway fund
    if (forfeitedAmount > 0) {
      console.log(`💰 Forfeited ${forfeitedAmount.toLocaleString()} VNĐ to Gateway fund from no-show members`);
      
      // You could create a Gateway fund transaction record here
      // await prisma.gatewayFundTransaction.create({
      //   data: {
      //     appointmentId,
      //     amount: forfeitedAmount,
      //     reason: 'NO_SHOW_FORFEIT',
      //     createdAt: new Date()
      //   }
      // });
    }

    return {
      success: true,
      distributedRewards,
      totalRewardsDistributed: distributedRewards.length
    };

  } catch (error) {
    console.error('Error distributing rewards:', error);
    return {
      success: false,
      distributedRewards: [],
      totalRewardsDistributed: 0,
      error: 'Failed to distribute rewards'
    };
  }
}

/**
 * Calculate expected rewards for an appointment
 */
export async function calculateExpectedRewards(
  appointmentId: string,
  memberCount: number
): Promise<{
  baseRewards: Array<{
    type: string;
    value: string;
    quantity: number;
  }>;
  timeBasedRewards: Array<{
    type: string;
    value: string;
    quantity: number;
    minHours: number;
  }>;
  memberCountRewards: Array<{
    type: string;
    value: string;
    quantity: number;
    minMembers: number;
  }>;
  totalExpectedRewards: number;
}> {
  try {
    const appointment = await prisma.gameAppointment.findUnique({
      where: { id: appointmentId },
      include: { tierConfig: true }
    });

    if (!appointment || !appointment.tierConfig) {
      throw new Error('Appointment or tier configuration not found');
    }

    const rewards = appointment.tierConfig.rewards as any;
    const hours = Math.ceil((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60 * 60));

    const baseRewards = rewards.baseRewards || [];
    const timeBasedRewards = (rewards.timeBasedRewards || []).filter((reward: any) => hours >= reward.minHours);
    const memberCountRewards = (rewards.memberCountRewards || []).filter((reward: any) => memberCount >= reward.minMembers);

    const totalExpectedRewards = baseRewards.length + timeBasedRewards.length + memberCountRewards.length;

    return {
      baseRewards,
      timeBasedRewards,
      memberCountRewards,
      totalExpectedRewards
    };

  } catch (error) {
    console.error('Error calculating expected rewards:', error);
    throw error;
  }
}

/**
 * Get user's reward history
 */
export async function getUserRewardHistory(
  userId: number,
  branch: string,
  limit: number = 20,
  offset: number = 0
): Promise<{
  rewards: Array<{
    id: string;
    appointmentId: string;
    rewardType: string;
    rewardValue: string;
    quantity: number;
    status: string;
    distributedAt: string | null;
    appointment: {
      title: string;
      game: string;
      tier: string;
    };
  }>;
  totalCount: number;
}> {
  try {
    const [rewards, totalCount] = await Promise.all([
      prisma.gameAppointmentReward.findMany({
        where: {
          userId,
          branch
        },
        include: {
          appointment: {
            select: {
              title: true,
              game: true,
              tier: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.gameAppointmentReward.count({
        where: {
          userId,
          branch
        }
      })
    ]);

    return {
      rewards: rewards.map(reward => ({
        id: reward.id,
        appointmentId: reward.appointmentId,
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        quantity: reward.quantity,
        status: reward.status,
        distributedAt: reward.distributedAt?.toISOString() || null,
        appointment: {
          title: reward.appointment.title,
          game: reward.appointment.game,
          tier: reward.appointment.tier || 'Unknown'
        }
      })),
      totalCount
    };

  } catch (error) {
    console.error('Error getting user reward history:', error);
    throw error;
  }
}

/**
 * Complete appointment and distribute rewards
 */
export async function completeAppointment(
  appointmentId: string,
  completionData: {
    completedMembers: Array<{
      userId: number;
      status: 'COMPLETED' | 'NO_SHOW';
    }>;
  }
): Promise<{
  success: boolean;
  rewardDistribution?: RewardDistributionResult;
  error?: string;
}> {
  try {
    const appointment = await prisma.gameAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        members: {
          where: { status: 'JOINED' }
        },
        tierConfig: true
      }
    });

    if (!appointment) {
      return {
        success: false,
        error: 'Appointment not found'
      };
    }

    if (appointment.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Appointment is not active'
      };
    }

    // Prepare completion data
    const completionDataWithAmounts: AppointmentCompletionData = {
      appointmentId,
      completedMembers: completionData.completedMembers.map(member => {
        const memberData = appointment.members.find(m => m.userId === member.userId);
        return {
          userId: member.userId,
          lockedAmount: memberData?.lockedAmount || 0,
          status: member.status
        };
      }),
      tier: appointment.tier,
      promotion: appointment.tierConfig?.rewards,
      totalLockedAmount: appointment.totalLockedAmount
    };

    // Distribute rewards
    const rewardDistribution = await distributeAppointmentRewards(completionDataWithAmounts);

    if (!rewardDistribution.success) {
      return {
        success: false,
        error: rewardDistribution.error
      };
    }

    return {
      success: true,
      rewardDistribution
    };

  } catch (error) {
    console.error('Error completing appointment:', error);
    return {
      success: false,
      error: 'Failed to complete appointment'
    };
  }
}

/**
 * Get appointment reward summary
 */
export async function getAppointmentRewardSummary(
  appointmentId: string
): Promise<{
  appointment: {
    id: string;
    title: string;
    game: string;
    tier: string;
    status: string;
    totalLockedAmount: number;
  };
  members: Array<{
    userId: number;
    lockedAmount: number;
    status: string;
    rewards: Array<{
      rewardType: string;
      rewardValue: string;
      quantity: number;
      status: string;
    }>;
  }>;
  totalRewardsDistributed: number;
  forfeitedAmount: number;
}> {
  try {
    const appointment = await prisma.gameAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        members: true,
        rewards: true
      }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const members = appointment.members.map(member => ({
      userId: member.userId,
      lockedAmount: member.lockedAmount,
      status: member.status,
      rewards: appointment.rewards
        .filter(reward => reward.userId === member.userId)
        .map(reward => ({
          rewardType: reward.rewardType,
          rewardValue: reward.rewardValue,
          quantity: reward.quantity,
          status: reward.status
        }))
    }));

    const totalRewardsDistributed = appointment.rewards.filter(r => r.status === 'DISTRIBUTED').length;
    const forfeitedAmount = appointment.members
      .filter(m => m.status === 'NO_SHOW')
      .reduce((sum, m) => sum + m.lockedAmount, 0);

    return {
      appointment: {
        id: appointment.id,
        title: appointment.title,
        game: appointment.game,
        tier: appointment.tier || 'Unknown',
        status: appointment.status,
        totalLockedAmount: appointment.totalLockedAmount
      },
      members,
      totalRewardsDistributed,
      forfeitedAmount
    };

  } catch (error) {
    console.error('Error getting appointment reward summary:', error);
    throw error;
  }
}
