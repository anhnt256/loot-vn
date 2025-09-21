"use server";

import { createSafeAction } from "@/lib/create-safe-action";
import { LeaveGameAppointmentSchema } from "./schema";
import { LeaveGameAppointmentResponse } from "./type";
import { db } from '@/lib/db';
import { autoDowngradeTier } from '@/lib/auto-tier-downgrade';
import { notifyUserLeft, notifyTierChanged } from '@/lib/game-appointment-notifications';
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export const leaveGameAppointmentAction = createSafeAction(
  LeaveGameAppointmentSchema,
  async (data): Promise<LeaveGameAppointmentResponse> => {
    try {
      // Get user info from cookies
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const branch = cookieStore.get("branch")?.value;

      if (!token) {
        return {
          success: false,
          error: "Bạn cần đăng nhập để rời hẹn chơi"
        };
      }

      if (!branch) {
        return {
          success: false,
          error: "Thiếu thông tin chi nhánh"
        };
      }

      // Verify JWT token
      const decoded = await verifyJWT(token);
      if (!decoded || !decoded.userId) {
        return {
          success: false,
          error: "Token không hợp lệ"
        };
      }

      const userId = parseInt(decoded.userId.toString());

      // Check if appointment exists and is active
      const appointmentResult = await db.$queryRaw`
        SELECT ga.*, gat.tierName, gat.tasks
        FROM GameAppointment ga
        LEFT JOIN GameAppointmentTier gat ON ga.tierId = gat.id
        WHERE ga.id = ${data.appointmentId}
      `;

      const appointment = (appointmentResult as any[])[0];
      if (!appointment) {
        return {
          success: false,
          error: "Hẹn chơi không tồn tại"
        };
      }

      if (appointment.status !== "ACTIVE") {
        return {
          success: false,
          error: "Hẹn chơi không còn hoạt động"
        };
      }

      // Check if user is a member
      const memberResult = await db.$queryRaw`
        SELECT id, userId, lockedAmount FROM GameAppointmentMember 
        WHERE appointmentId = ${data.appointmentId} AND userId = ${userId} AND status = 'JOINED'
      `;

      const member = (memberResult as any[])[0];
      if (!member) {
        return {
          success: false,
          error: "Bạn chưa tham gia hẹn chơi này"
        };
      }

      // Check if user is the creator
      if (appointment.creatorId === userId) {
        return {
          success: false,
          error: "Người tạo hẹn chơi không thể rời. Hãy hủy hẹn chơi thay vào đó."
        };
      }

      // Update member status to LEFT
      await db.$executeRaw`
        UPDATE GameAppointmentMember 
        SET status = 'LEFT' 
        WHERE id = ${member.id}
      `;

      // Update appointment member count and total locked amount
      await db.$executeRaw`
        UPDATE GameAppointment 
        SET currentMembers = currentMembers - 1, 
            totalLockedAmount = totalLockedAmount - ${member.lockedAmount}
        WHERE id = ${data.appointmentId}
      `;

      const result = {
        id: member.id,
        appointmentId: data.appointmentId,
        userId: member.userId,
        status: "LEFT"
      };

      // Auto downgrade tier after member count change
      const tierChangeResult = await autoDowngradeTier(data.appointmentId);

      // Get updated appointment with tier info
      const updatedAppointmentResult = await db.$queryRaw`
        SELECT ga.*, gat.tierName, gat.tasks
        FROM GameAppointment ga
        LEFT JOIN GameAppointmentTier gat ON ga.tierId = gat.id
        WHERE ga.id = ${data.appointmentId}
      `;

      const updatedAppointment = (updatedAppointmentResult as any[])[0];

      // Send notifications
      await notifyUserLeft(data.appointmentId, userId, {
        title: appointment.title,
        game: appointment.game,
        currentMembers: appointment.currentMembers - 1,
        maxMembers: appointment.maxMembers,
        tier: updatedAppointment?.tier
      });

      // Send tier change notification if tier changed
      if (tierChangeResult.success && tierChangeResult.oldTier !== tierChangeResult.newTier) {
        await notifyTierChanged(data.appointmentId, {
          appointmentId: data.appointmentId,
          oldTier: tierChangeResult.oldTier || null,
          newTier: tierChangeResult.newTier || null,
          promotion: undefined,
          memberCount: appointment.currentMembers - 1,
          reason: 'Member count changed'
        });
      }

      let promotion = undefined;
      let tierChange = undefined;

      if (updatedAppointment?.tasks) {
        const tasks = JSON.parse(updatedAppointment.tasks || '[]');
        promotion = {
          promotion: 'Task-based rewards',
          description: 'Complete tasks to earn rewards',
          businessLogic: 'Reward distribution based on task completion',
          minNetProfit: tasks.reduce((sum: number, task: any) => sum + task.rewardAmount, 0)
        };
      }

      // If tier changed, include tier change info
      if (tierChangeResult.success && tierChangeResult.oldTier !== tierChangeResult.newTier) {
        tierChange = {
          oldTier: tierChangeResult.oldTier || 'None',
          newTier: tierChangeResult.newTier || 'None',
          promotion: promotion || {
            promotion: 'No promotion',
            description: 'No promotion available',
            businessLogic: 'No business logic',
            minNetProfit: 0
          }
        };
      }

      return {
        success: true,
        data: {
          appointmentId: result.appointmentId,
          userId: result.userId,
          unlockedAmount: member.lockedAmount,
          status: result.status,
          leftAt: new Date().toISOString(),
          tierChange,
          promotion
        }
      };

    } catch (error) {
      console.error("Error leaving game appointment:", error);
      return {
        success: false,
        error: "Có lỗi xảy ra khi rời hẹn chơi. Vui lòng thử lại."
      };
    }
  }
);
