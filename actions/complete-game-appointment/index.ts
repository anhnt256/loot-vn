"use server";

import { createSafeAction } from "@/lib/create-safe-action";
import { CompleteGameAppointmentSchema } from "./schema";
import { CompleteGameAppointmentResponse } from "./type";
import { completeAppointment } from '@/lib/reward-distribution';
import { notifyAppointmentCompleted } from '@/lib/game-appointment-notifications';
import { db } from '@/lib/db';
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export const completeGameAppointmentAction = createSafeAction(
  CompleteGameAppointmentSchema,
  async (data): Promise<CompleteGameAppointmentResponse> => {
    try {
      // Get user info from cookies
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const branch = cookieStore.get("branch")?.value;

      if (!token) {
        return {
          success: false,
          error: "Bạn cần đăng nhập để hoàn thành hẹn chơi"
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

      // Check if appointment exists and user has permission
      const appointment = await db.gameAppointment.findUnique({
        where: { id: data.appointmentId },
        include: {
          members: {
            where: { status: 'JOINED' }
          }
        }
      });

      if (!appointment) {
        return {
          success: false,
          error: "Hẹn chơi không tồn tại"
        };
      }

      // Check if user is creator or admin
      if (appointment.creatorId !== userId) {
        // You might want to add admin check here
        return {
          success: false,
          error: "Chỉ người tạo hẹn chơi mới có thể hoàn thành"
        };
      }

      if (appointment.status !== "ACTIVE") {
        return {
          success: false,
          error: "Hẹn chơi không còn hoạt động"
        };
      }

      // Validate that all members are accounted for
      const memberIds = appointment.members.map(m => m.userId);
      const completedMemberIds = data.completedMembers.map(m => m.userId);
      
      const missingMembers = memberIds.filter(id => !completedMemberIds.includes(id));
      if (missingMembers.length > 0) {
        return {
          success: false,
          error: `Thiếu thông tin cho các thành viên: ${missingMembers.join(', ')}`
        };
      }

      // Complete appointment and distribute rewards
      const result = await completeAppointment(data.appointmentId, {
        completedMembers: data.completedMembers
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      // Send completion notification
      await notifyAppointmentCompleted(data.appointmentId, {
        title: appointment.title,
        game: appointment.game,
        tier: appointment.tier,
        promotion: appointment.tierConfig?.rewards,
        totalLockedAmount: appointment.totalLockedAmount
      });

      // Calculate forfeited amount
      const forfeitedAmount = data.completedMembers
        .filter(m => m.status === 'NO_SHOW')
        .reduce((sum, member) => {
          const memberData = appointment.members.find(m => m.userId === member.userId);
          return sum + (memberData?.lockedAmount || 0);
        }, 0);

      return {
        success: true,
        data: {
          appointmentId: data.appointmentId,
          status: "COMPLETED",
          rewardDistribution: {
            distributedRewards: result.rewardDistribution?.distributedRewards || [],
            totalRewardsDistributed: result.rewardDistribution?.totalRewardsDistributed || 0
          },
          forfeitedAmount
        }
      };

    } catch (error) {
      console.error("Error completing game appointment:", error);
      return {
        success: false,
        error: "Có lỗi xảy ra khi hoàn thành hẹn chơi. Vui lòng thử lại."
      };
    }
  }
);
