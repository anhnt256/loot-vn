import { db } from "@/lib/db";
import {
  calculateTier,
  getTierDowngradeOptions,
} from "./game-appointment-utils";

export interface TierChangeResult {
  success: boolean;
  oldTier?: string;
  newTier?: string;
  quest?: {
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
  };
  error?: string;
}

/**
 * Auto downgrade tier when member count changes
 * This function should be called when:
 * - User joins an appointment
 * - User leaves an appointment
 * - Appointment is updated
 */
export async function autoDowngradeTier(
  appointmentId: string,
): Promise<TierChangeResult> {
  try {
    // Get current appointment with members
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

    // Get current members count
    const membersResult = await db.$queryRaw`
      SELECT COUNT(*) as count FROM GameAppointmentMember 
      WHERE appointmentId = ${appointmentId} AND status = 'JOINED'
    `;

    const currentTier = appointment.tierName;
    const currentMembers = (membersResult as any[])[0].count;
    const hours = Math.ceil(
      (new Date(appointment.endTime).getTime() -
        new Date(appointment.startTime).getTime()) /
        (1000 * 60 * 60),
    );

    // Calculate new tier based on current conditions
    const newTier = await calculateTier({
      members: currentMembers,
      hours,
    });

    // If no tier is available, set to null (needs manual activation)
    if (!newTier) {
      await db.$executeRaw`
        UPDATE GameAppointment 
        SET tierId = NULL, status = 'ACTIVE'
        WHERE id = ${appointmentId}
      `;

      return {
        success: true,
        oldTier: currentTier,
        newTier: undefined,
        error: "No tier available. Requires manual activation by admin.",
      };
    }

    // If tier hasn't changed, no action needed
    if (currentTier === newTier.tierName) {
      return {
        success: true,
        oldTier: currentTier,
        newTier: newTier.tierName,
        quest: newTier,
      };
    }

    // Find the tier in database to get the ID
    const tierInDbResult = await db.$queryRaw`
      SELECT id FROM GameAppointmentTier 
      WHERE tierName = ${newTier.tierName}
    `;

    const tierInDb = (tierInDbResult as any[])[0];
    if (!tierInDb) {
      return {
        success: false,
        error: "Tier not found in database",
      };
    }

    // Tier has changed, update appointment
    await db.$executeRaw`
      UPDATE GameAppointment 
      SET tierId = ${tierInDb.id}
      WHERE id = ${appointmentId}
    `;

    // Log tier change for audit
    await logTierChange(appointmentId, currentTier, newTier.tierName, {
      members: currentMembers,
      hours,
    });

    return {
      success: true,
      oldTier: currentTier,
      newTier: newTier.tierName,
      quest: newTier,
    };
  } catch (error) {
    console.error("Error in auto tier downgrade:", error);
    return {
      success: false,
      error: "Failed to auto downgrade tier",
    };
  }
}

/**
 * Check if appointment needs manual activation
 */
export async function checkManualActivationNeeded(
  appointmentId: string,
): Promise<{
  needsManualActivation: boolean;
  reason?: string;
  currentConditions: {
    members: number;
    hours: number;
  };
}> {
  try {
    const appointment = await db.gameAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        members: {
          where: { status: "joined" },
        },
      },
    });

    if (!appointment) {
      return {
        needsManualActivation: false,
        reason: "Appointment not found",
        currentConditions: { members: 0, hours: 0 },
      };
    }

    const currentMembers = appointment.members.length;
    const hours = Math.ceil(
      (appointment.endTime.getTime() - appointment.startTime.getTime()) /
        (1000 * 60 * 60),
    );

    const tier = await calculateTier({
      members: currentMembers,
      hours,
    });

    const currentConditions = { members: currentMembers, hours };

    if (!tier) {
      return {
        needsManualActivation: true,
        reason: `Current conditions (${currentMembers} members, ${hours} hours) do not meet any tier requirements`,
        currentConditions,
      };
    }

    return {
      needsManualActivation: false,
      currentConditions,
    };
  } catch (error) {
    console.error("Error checking manual activation:", error);
    return {
      needsManualActivation: false,
      reason: "Error checking conditions",
      currentConditions: { members: 0, hours: 0 },
    };
  }
}

/**
 * Get available tier options for manual activation
 */
export async function getManualActivationOptions(
  appointmentId: string,
): Promise<{
  currentConditions: {
    members: number;
    hours: number;
  };
  availableTiers: Array<{
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
  }>;
}> {
  try {
    const appointment = await db.gameAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        members: {
          where: { status: "joined" },
        },
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const currentMembers = appointment.members.length;
    const hours = Math.ceil(
      (appointment.endTime.getTime() - appointment.startTime.getTime()) /
        (1000 * 60 * 60),
    );

    const currentConditions = { members: currentMembers, hours };

    // Get all available tiers
    const allTiers = await db.gameAppointmentTier.findMany({
      where: { isActive: true },
      orderBy: { minMembers: "asc" },
    });

    const availableTiers = allTiers.map((tier) => ({
      tierName: tier.tierName,
      questName: tier.questName,
      minMembers: tier.minMembers,
      maxMembers: tier.maxMembers,
      minHours: tier.minHours,
      lockedAmount: tier.lockedAmount,
      tasks: tier.tasks as any,
    }));

    return {
      currentConditions,
      availableTiers: availableTiers.map((tier) => ({
        ...tier,
        maxMembers: tier.maxMembers === null ? undefined : tier.maxMembers,
      })),
    };
  } catch (error) {
    console.error("Error getting manual activation options:", error);
    throw error;
  }
}

/**
 * Log tier changes for audit trail
 */
async function logTierChange(
  appointmentId: string,
  oldTier: string | null,
  newTier: string | null,
  conditions: { members: number; hours: number },
): Promise<void> {
  try {
    // This could be stored in a separate audit table
    console.log(`Tier change for appointment ${appointmentId}:`, {
      oldTier,
      newTier,
      conditions,
      timestamp: new Date().toISOString(),
    });

    // You could also store this in a database table for audit purposes
    // await prisma.tierChangeLog.create({
    //   data: {
    //     appointmentId,
    //     oldTier,
    //     newTier,
    //     memberCount: conditions.members,
    //     hours: conditions.hours,
    //     changedAt: new Date()
    //   }
    // });
  } catch (error) {
    console.error("Error logging tier change:", error);
  }
}

/**
 * Batch process all active appointments for tier updates
 * This can be run as a scheduled job
 */
export async function batchUpdateAppointmentTiers(): Promise<{
  processed: number;
  updated: number;
  errors: number;
  results: Array<{
    appointmentId: string;
    success: boolean;
    oldTier?: string;
    newTier?: string;
    error?: string;
  }>;
}> {
  try {
    const activeAppointments = await db.gameAppointment.findMany({
      where: { status: "active" },
      select: { id: true },
    });

    const results = [];
    let updated = 0;
    let errors = 0;

    for (const appointment of activeAppointments) {
      try {
        const result = await autoDowngradeTier(appointment.id);
        results.push({
          appointmentId: appointment.id,
          success: result.success,
          oldTier: result.oldTier,
          newTier: result.newTier,
          error: result.error,
        });

        if (result.success && result.oldTier !== result.newTier) {
          updated++;
        }
      } catch (error) {
        errors++;
        results.push({
          appointmentId: appointment.id,
          success: false,
          error: "Processing error",
        });
      }
    }

    return {
      processed: activeAppointments.length,
      updated,
      errors,
      results,
    };
  } catch (error) {
    console.error("Error in batch update:", error);
    throw error;
  }
}
