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

      const userId = parseInt(decoded.userId);

      // Check if appointment exists and is active
      const appointment = await db.gameAppointment.findUnique({
        where: { id: data.appointmentId },
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
      const member = appointment.members.find(m => m.userId === userId);
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

      // Use transaction to ensure data consistency
      const result = await db.$transaction(async (tx) => {
        // Update member status to LEFT
        const updatedMember = await tx.gameAppointmentMember.update({
          where: { id: member.id },
          data: {
            status: "LEFT"
          }
        });

        // Update appointment member count and total locked amount
        await tx.gameAppointment.update({
          where: { id: data.appointmentId },
          data: {
            currentMembers: appointment.currentMembers - 1,
            totalLockedAmount: appointment.totalLockedAmount - member.lockedAmount
          }
        });

        return updatedMember;
      });

      // Auto downgrade tier after member count change
      const tierChangeResult = await autoDowngradeTier(data.appointmentId);

      // Get updated appointment with tier info
      const updatedAppointment = await db.gameAppointment.findUnique({
        where: { id: data.appointmentId },
        include: { tierConfig: true }
      });

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
          oldTier: tierChangeResult.oldTier,
          newTier: tierChangeResult.newTier,
          promotion: tierChangeResult.promotion,
          memberCount: appointment.currentMembers - 1,
          reason: 'Member count changed'
        });
      }

      let promotion = undefined;
      let tierChange = undefined;

      if (updatedAppointment?.tierConfig) {
        const rewards = updatedAppointment.tierConfig.rewards as any;
        promotion = {
          promotion: rewards.promotion,
          description: rewards.description,
          businessLogic: rewards.businessLogic,
          minNetProfit: rewards.minNetProfit
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
