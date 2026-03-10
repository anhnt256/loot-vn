import { db } from "./db";

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
    status: "COMPLETED" | "NO_SHOW";
  }>;
  tier?: string;
  promotion?: any;
  totalLockedAmount: number;
}

/**
 * Distribute rewards for completed appointment
 */
export async function distributeAppointmentRewards(
  completionData: AppointmentCompletionData,
): Promise<RewardDistributionResult> {
  try {
    const {
      appointmentId,
      completedMembers,
      tier,
      promotion,
      totalLockedAmount,
    } = completionData;

    // Get appointment details
    const appointmentResult = await db.$queryRaw`
      SELECT ga.*, gat.tierName, gat.questName, gat.minMembers, gat.maxMembers, 
             gat.minHours, gat.lockedAmount, gat.tasks
      FROM GameAppointment ga
      LEFT JOIN GameAppointmentTier gat ON ga.tierId = gat.id
      WHERE ga.id = ${appointmentId}
    `;

    const appointment = (appointmentResult as any[])[0];
    if (!appointment) {
      return {
        success: false,
        distributedRewards: [],
        totalRewardsDistributed: 0,
        error: "Appointment not found",
      };
    }

    // Get tier configuration
    if (!appointment.tierName || !tier) {
      return {
        success: false,
        distributedRewards: [],
        totalRewardsDistributed: 0,
        error: "No tier configuration found",
      };
    }

    const tasks = JSON.parse(appointment.tasks || "[]");
    const distributedRewards = [];

    // Distribute rewards to all completed members
    for (const member of completedMembers.filter(
      (m) => m.status === "COMPLETED",
    )) {
      // Distribute task rewards
      for (const task of tasks) {
        await db.$executeRaw`
          INSERT INTO GameAppointmentReward 
          (id, appointmentId, userId, branch, taskId, taskName, rewardAmount, status, distributedAt, createdAt)
          VALUES (${`reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}, ${appointmentId}, ${member.userId}, ${appointment.branch}, ${task.taskId}, ${task.taskName}, ${task.rewardAmount}, 'DISTRIBUTED', NOW(), NOW())
        `;

        distributedRewards.push({
          userId: member.userId,
          rewardType: task.taskId,
          rewardValue: task.rewardAmount.toString(),
          quantity: 1,
          status: "DISTRIBUTED",
        });
      }
    }

    // Handle no-show members (forfeit locked amount to Gateway fund)
    const noShowMembers = completedMembers.filter(
      (m) => m.status === "NO_SHOW",
    );
    let forfeitedAmount = 0;

    for (const member of noShowMembers) {
      forfeitedAmount += member.lockedAmount;

      // Update member status
      await db.$executeRaw`
        UPDATE GameAppointmentMember 
        SET status = 'NO_SHOW' 
        WHERE appointmentId = ${appointmentId} AND userId = ${member.userId}
      `;
    }

    // Update appointment status
    await db.$executeRaw`
      UPDATE GameAppointment 
      SET status = 'COMPLETED' 
      WHERE id = ${appointmentId}
    `;

    // Log forfeited amount to Gateway fund
    if (forfeitedAmount > 0) {
      console.log(
        `💰 Forfeited ${forfeitedAmount.toLocaleString()} VNĐ to Gateway fund from no-show members`,
      );

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
      totalRewardsDistributed: distributedRewards.length,
    };
  } catch (error) {
    console.error("Error distributing rewards:", error);
    return {
      success: false,
      distributedRewards: [],
      totalRewardsDistributed: 0,
      error: "Failed to distribute rewards",
    };
  }
}

/**
 * Calculate expected rewards for an appointment
 */
export async function calculateExpectedRewards(
  appointmentId: string,
  memberCount: number,
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
    const appointmentResult = await db.$queryRaw`
      SELECT ga.*, gat.tasks
      FROM GameAppointment ga
      LEFT JOIN GameAppointmentTier gat ON ga.tierId = gat.id
      WHERE ga.id = ${appointmentId}
    `;

    const appointment = (appointmentResult as any[])[0];
    if (!appointment || !appointment.tasks) {
      throw new Error("Appointment or tier configuration not found");
    }

    const tasks = JSON.parse(appointment.tasks || "[]");
    const hours = Math.ceil(
      (new Date(appointment.endTime).getTime() -
        new Date(appointment.startTime).getTime()) /
        (1000 * 60 * 60),
    );

    const baseRewards = tasks.map((task: any) => ({
      type: task.taskId,
      value: task.rewardAmount.toString(),
      quantity: 1,
    }));

    const timeBasedRewards: any[] = [];
    const memberCountRewards: any[] = [];

    const totalExpectedRewards = baseRewards.length;

    return {
      baseRewards,
      timeBasedRewards,
      memberCountRewards,
      totalExpectedRewards,
    };
  } catch (error) {
    console.error("Error calculating expected rewards:", error);
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
  offset: number = 0,
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
    const [rewardsResult, totalCountResult] = await Promise.all([
      db.$queryRaw`
        SELECT gar.*, ga.title, ga.game, ga.tier
        FROM GameAppointmentReward gar
        LEFT JOIN GameAppointment ga ON gar.appointmentId = ga.id
        WHERE gar.userId = ${userId} AND gar.branch = ${branch}
        ORDER BY gar.createdAt DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      db.$queryRaw`
        SELECT COUNT(*) as count
        FROM GameAppointmentReward
        WHERE userId = ${userId} AND branch = ${branch}
      `,
    ]);

    const rewards = rewardsResult as any[];
    const totalCount = (totalCountResult as any[])[0].count;

    return {
      rewards: rewards.map((reward) => ({
        id: reward.id,
        appointmentId: reward.appointmentId,
        rewardType: reward.taskId,
        rewardValue: reward.rewardAmount.toString(),
        quantity: 1,
        status: reward.status,
        distributedAt: reward.distributedAt
          ? new Date(reward.distributedAt).toISOString()
          : null,
        appointment: {
          title: reward.title,
          game: reward.game,
          tier: reward.tier || "Unknown",
        },
      })),
      totalCount,
    };
  } catch (error) {
    console.error("Error getting user reward history:", error);
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
      status: "COMPLETED" | "NO_SHOW";
    }>;
  },
): Promise<{
  success: boolean;
  rewardDistribution?: RewardDistributionResult;
  error?: string;
}> {
  try {
    const appointmentResult = await db.$queryRaw`
      SELECT ga.*, gat.tierName, gat.tasks
      FROM GameAppointment ga
      LEFT JOIN GameAppointmentTier gat ON ga.tierId = gat.id
      WHERE ga.id = ${appointmentId}
    `;

    const appointment = (appointmentResult as any[])[0];
    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    if (appointment.status !== "ACTIVE") {
      return {
        success: false,
        error: "Appointment is not active",
      };
    }

    // Get members data
    const membersResult = await db.$queryRaw`
      SELECT userId, lockedAmount
      FROM GameAppointmentMember
      WHERE appointmentId = ${appointmentId} AND status = 'JOINED'
    `;

    const members = membersResult as any[];

    // Prepare completion data
    const completionDataWithAmounts: AppointmentCompletionData = {
      appointmentId,
      completedMembers: completionData.completedMembers.map((member) => {
        const memberData = members.find((m) => m.userId === member.userId);
        return {
          userId: member.userId,
          lockedAmount: memberData?.lockedAmount || 0,
          status: member.status,
        };
      }),
      tier: appointment.tierName,
      promotion: appointment.tasks,
      totalLockedAmount: appointment.totalLockedAmount,
    };

    // Distribute rewards
    const rewardDistribution = await distributeAppointmentRewards(
      completionDataWithAmounts,
    );

    if (!rewardDistribution.success) {
      return {
        success: false,
        error: rewardDistribution.error,
      };
    }

    return {
      success: true,
      rewardDistribution,
    };
  } catch (error) {
    console.error("Error completing appointment:", error);
    return {
      success: false,
      error: "Failed to complete appointment",
    };
  }
}

/**
 * Get appointment reward summary
 */
export async function getAppointmentRewardSummary(
  appointmentId: string,
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
    const appointmentResult = await db.$queryRaw`
      SELECT ga.*, gat.tierName
      FROM GameAppointment ga
      LEFT JOIN GameAppointmentTier gat ON ga.tierId = gat.id
      WHERE ga.id = ${appointmentId}
    `;

    const appointment = (appointmentResult as any[])[0];
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const [membersResult, rewardsResult] = await Promise.all([
      db.$queryRaw`
        SELECT userId, lockedAmount, status
        FROM GameAppointmentMember
        WHERE appointmentId = ${appointmentId}
      `,
      db.$queryRaw`
        SELECT userId, taskId, rewardAmount, status
        FROM GameAppointmentReward
        WHERE appointmentId = ${appointmentId}
      `,
    ]);

    const members = membersResult as any[];
    const rewards = rewardsResult as any[];

    const membersWithRewards = members.map((member) => ({
      userId: member.userId,
      lockedAmount: member.lockedAmount,
      status: member.status,
      rewards: rewards
        .filter((reward) => reward.userId === member.userId)
        .map((reward) => ({
          rewardType: reward.taskId,
          rewardValue: reward.rewardAmount.toString(),
          quantity: 1,
          status: reward.status,
        })),
    }));

    const totalRewardsDistributed = rewards.filter(
      (r) => r.status === "DISTRIBUTED",
    ).length;
    const forfeitedAmount = members
      .filter((m) => m.status === "NO_SHOW")
      .reduce((sum, m) => sum + Number(m.lockedAmount), 0);

    return {
      appointment: {
        id: appointment.id,
        title: appointment.title,
        game: appointment.game,
        tier: appointment.tierName || "Unknown",
        status: appointment.status,
        totalLockedAmount: Number(appointment.totalLockedAmount),
      },
      members: membersWithRewards,
      totalRewardsDistributed,
      forfeitedAmount,
    };
  } catch (error) {
    console.error("Error getting appointment reward summary:", error);
    throw error;
  }
}
