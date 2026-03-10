import { db } from "@/lib/db";

export interface TierCalculationParams {
  members: number;
  hours: number;
}

export interface TierResult {
  tierName: string;
  questName: string;
  minMembers: number;
  maxMembers?: number;
  minHours: number;
  lockedAmount: number;
  tasks: Array<{
    taskId: string;
    taskName: string;
    challenge: string;
    rewardAmount: number;
    requiredQuantity: number;
    itemType: string;
  }>;
}

/**
 * Calculate the appropriate tier for a game appointment based on members and hours
 */
export async function calculateTier(
  params: TierCalculationParams,
): Promise<TierResult | null> {
  const { members, hours } = params;

  try {
    // Get all active tiers ordered by priority (highest members first)
    const tiers = await db.gameAppointmentTier.findMany({
      where: { isActive: true },
      orderBy: { minMembers: "desc" },
    });

    // Find the first tier that meets all requirements
    const eligibleTier = tiers.find((tier) => {
      const meetsMinMembers = members >= tier.minMembers;
      const meetsMaxMembers = !tier.maxMembers || members <= tier.maxMembers;
      const meetsMinHours = hours >= tier.minHours;

      return meetsMinMembers && meetsMaxMembers && meetsMinHours;
    });

    if (!eligibleTier) {
      return null;
    }

    const tasks = eligibleTier.tasks as any;

    return {
      tierName: eligibleTier.tierName,
      questName: eligibleTier.questName,
      minMembers: eligibleTier.minMembers,
      maxMembers:
        eligibleTier.maxMembers === null ? undefined : eligibleTier.maxMembers,
      minHours: eligibleTier.minHours,
      lockedAmount: eligibleTier.lockedAmount,
      tasks: tasks,
    };
  } catch (error) {
    console.error("Error calculating tier:", error);
    return null;
  }
}

/**
 * Calculate locked amount for a user joining an appointment
 * Now uses fixed amount from tier (30,000 VNĐ per member)
 */
export function calculateLockedAmount(tier: TierResult): number {
  return tier.lockedAmount;
}

/**
 * Calculate total potential rewards for completing all tasks in a tier
 */
export function calculateTotalRewards(tier: TierResult): number {
  return tier.tasks.reduce((total, task) => total + task.rewardAmount, 0);
}

/**
 * Check if appointment can be auto-activated or needs manual activation
 */
export async function canAutoActivate(
  params: TierCalculationParams,
): Promise<boolean> {
  const tier = await calculateTier(params);
  return tier !== null;
}

/**
 * Get tier downgrade options when requirements are not met
 */
export async function getTierDowngradeOptions(
  params: TierCalculationParams,
): Promise<TierResult[]> {
  const { members, hours } = params;

  try {
    const tiers = await db.gameAppointmentTier.findMany({
      where: { isActive: true },
      orderBy: { minMembers: "desc" },
    });

    const eligibleTiers = tiers.filter((tier) => {
      const meetsMinMembers = members >= tier.minMembers;
      const meetsMaxMembers = !tier.maxMembers || members <= tier.maxMembers;
      const meetsMinHours = hours >= tier.minHours;

      return meetsMinMembers && meetsMaxMembers && meetsMinHours;
    });

    return eligibleTiers.map((tier) => {
      const tasks = tier.tasks as any;
      return {
        tierName: tier.tierName,
        questName: tier.questName,
        minMembers: tier.minMembers,
        maxMembers: tier.maxMembers === null ? undefined : tier.maxMembers,
        minHours: tier.minHours,
        lockedAmount: tier.lockedAmount,
        tasks: tasks,
      };
    });
  } catch (error) {
    console.error("Error getting tier downgrade options:", error);
    return [];
  }
}

/**
 * Generate quest description for UI display
 */
export function generateQuestDescription(tier: TierResult): string {
  const totalRewards = calculateTotalRewards(tier);
  return `${tier.questName}: Hoàn thành ${tier.tasks.length} nhiệm vụ để nhận tổng cộng ${totalRewards.toLocaleString()} VNĐ`;
}

/**
 * Validate appointment parameters before creation
 */
export async function validateAppointmentParams(params: {
  members: number;
  hours: number;
  startTime: Date;
  endTime: Date;
}): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Basic validations
  if (params.members < 1) {
    errors.push("Số lượng thành viên phải ít nhất là 1");
  }

  if (params.hours < 1) {
    errors.push("Thời gian chơi phải ít nhất là 1 giờ");
  }

  if (params.startTime >= params.endTime) {
    errors.push("Thời gian bắt đầu phải trước thời gian kết thúc");
  }

  // Check if any tier is available
  const tier = await calculateTier({
    members: params.members,
    hours: params.hours,
  });

  if (!tier) {
    errors.push(
      "Không có tier nào phù hợp với điều kiện này. Cần admin kích hoạt thủ công.",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get tier statistics for admin dashboard
 */
export async function getTierStatistics(): Promise<{
  totalTiers: number;
  activeTiers: number;
  tierDistribution: Array<{
    tierName: string;
    questName: string;
    minMembers: number;
    maxMembers?: number;
    minHours: number;
    lockedAmount: number;
    totalRewards: number;
  }>;
}> {
  try {
    const tiers = await db.gameAppointmentTier.findMany({
      where: { isActive: true },
      orderBy: { minMembers: "asc" },
    });

    const tierDistribution = tiers.map((tier) => {
      const tasks = tier.tasks as any;
      const totalRewards = tasks.reduce(
        (sum: number, task: any) => sum + task.rewardAmount,
        0,
      );

      return {
        tierName: tier.tierName,
        questName: tier.questName,
        minMembers: tier.minMembers,
        maxMembers: tier.maxMembers,
        minHours: tier.minHours,
        lockedAmount: tier.lockedAmount,
        totalRewards,
      };
    });

    return {
      totalTiers: tiers.length,
      activeTiers: tiers.filter((tier) => tier.isActive).length,
      tierDistribution: tierDistribution.map((tier) => ({
        ...tier,
        maxMembers: tier.maxMembers === null ? undefined : tier.maxMembers,
      })),
    };
  } catch (error) {
    console.error("Error getting tier statistics:", error);
    return {
      totalTiers: 0,
      activeTiers: 0,
      tierDistribution: [],
    };
  }
}
