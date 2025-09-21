import { db } from '@/lib/db';

export interface TierInfo {
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

export async function getAvailableTiers(): Promise<TierInfo[]> {
  try {
    const tiers = await db.gameAppointmentTier.findMany({
      where: { isActive: true },
      orderBy: { minMembers: 'asc' }
    });

    return tiers.map(tier => ({
      tierName: tier.tierName,
      questName: tier.questName,
      minMembers: tier.minMembers,
      maxMembers: tier.maxMembers,
      minHours: tier.minHours,
      lockedAmount: tier.lockedAmount,
      tasks: tier.tasks as any
    }));
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return [];
  }
}

export function getTierForConditions(
  tiers: TierInfo[],
  members: number,
  hours: number
): TierInfo | null {
  return tiers.find(tier => {
    const meetsMinMembers = members >= tier.minMembers;
    const meetsMaxMembers = !tier.maxMembers || members <= tier.maxMembers;
    const meetsMinHours = hours >= tier.minHours;
    
    return meetsMinMembers && meetsMaxMembers && meetsMinHours;
  }) || null;
}
