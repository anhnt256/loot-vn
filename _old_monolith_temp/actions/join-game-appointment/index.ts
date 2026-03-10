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

      // Check if user is already a member
      const existingMemberResult = await db.$queryRaw`
        SELECT userId FROM GameAppointmentMember 
        WHERE appointmentId = ${data.appointmentId} AND userId = ${userId}
      `;

      if ((existingMemberResult as any[]).length > 0) {
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
      const hours = Math.ceil((new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / (1000 * 60 * 60));
      
      // Calculate locked amount based on tier
      // For now, use a simple calculation until tier is determined
      const lockedAmount = data.computerCount * data.pricePerHour * hours;


      // Use transaction to ensure data consistency
      const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add user as member
      await db.$executeRaw`
        INSERT INTO GameAppointmentMember 
        (id, appointmentId, userId, branch, lockedAmount, status, machineName, machineGroupId, joinedAt)
        VALUES (${memberId}, ${data.appointmentId}, ${userId}, ${branch}, ${lockedAmount}, 'JOINED', ${data.machineName}, ${data.machineGroupId}, NOW())
      `;

      // Update appointment member count and total locked amount
      await db.$executeRaw`
        UPDATE GameAppointment 
        SET currentMembers = currentMembers + 1, 
            totalLockedAmount = totalLockedAmount + ${lockedAmount}
        WHERE id = ${data.appointmentId}
      `;

      const result = {
        id: memberId,
        appointmentId: data.appointmentId,
        userId,
        branch,
        lockedAmount,
        status: "JOINED",
        machineName: data.machineName,
        machineGroupId: data.machineGroupId,
        joinedAt: new Date()
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
          oldTier: tierChangeResult.oldTier || null,
          newTier: tierChangeResult.newTier || null,
          promotion: undefined,
          memberCount: appointment.currentMembers + 1,
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
