"use server";

import { createSafeAction } from "@/lib/create-safe-action";
import { JoinGameAppointmentSchema } from "./schema";
import { JoinGameAppointmentResponse } from "./type";
import { db } from '@/lib/db';
import { calculateLockedAmount } from '@/lib/game-appointment-utils';
import { autoDowngradeTier } from '@/lib/auto-tier-downgrade';
import { notifyUserJoined, notifyTierChanged } from '@/lib/game-appointment-notifications';
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export const joinGameAppointmentAction = createSafeAction(
  JoinGameAppointmentSchema,
  async (data): Promise<JoinGameAppointmentResponse> => {
    try {
      // Get user info from cookies
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const branch = cookieStore.get("branch")?.value;

      if (!token) {
        return {
          success: false,
          error: "Bạn cần đăng nhập để tham gia hẹn chơi"
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
          members: true,
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

      // Check if user is already a member
      const existingMember = appointment.members.find(member => member.userId === userId);
      if (existingMember) {
        return {
          success: false,
          error: "Bạn đã tham gia hẹn chơi này rồi"
        };
      }

      // Check if appointment is full
      if (appointment.currentMembers >= appointment.maxMembers) {
        return {
          success: false,
          error: "Hẹn chơi đã đủ thành viên"
        };
      }

      // Calculate hours
      const hours = Math.ceil((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60 * 60));
      
      // Calculate locked amount
      const lockedAmount = calculateLockedAmount(
        data.computerCount,
        data.pricePerHour,
        hours
      );


      // Use transaction to ensure data consistency
      const result = await db.$transaction(async (tx) => {
        // Add user as member
        const member = await tx.gameAppointmentMember.create({
          data: {
            appointmentId: data.appointmentId,
            userId,
            branch,
            lockedAmount,
            status: "JOINED",
            machineName: data.machineName,
            machineGroupId: data.machineGroupId
          }
        });

        // Update appointment member count and total locked amount
        await tx.gameAppointment.update({
          where: { id: data.appointmentId },
          data: {
            currentMembers: appointment.currentMembers + 1,
            totalLockedAmount: appointment.totalLockedAmount + lockedAmount
          }
        });

        return member;
      });

      // Auto downgrade tier after member count change
      const tierChangeResult = await autoDowngradeTier(data.appointmentId);

      // Get updated appointment with tier info
      const updatedAppointment = await db.gameAppointment.findUnique({
        where: { id: data.appointmentId },
        include: { tierConfig: true }
      });

      // Send notifications
      await notifyUserJoined(data.appointmentId, userId, {
        title: appointment.title,
        game: appointment.game,
        currentMembers: appointment.currentMembers + 1,
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
          memberCount: appointment.currentMembers + 1,
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
          lockedAmount: result.lockedAmount,
          status: result.status,
          joinedAt: result.joinedAt.toISOString(),
          tierChange,
          promotion
        }
      };

    } catch (error) {
      console.error("Error joining game appointment:", error);
      return {
        success: false,
        error: "Có lỗi xảy ra khi tham gia hẹn chơi. Vui lòng thử lại."
      };
    }
  }
);
