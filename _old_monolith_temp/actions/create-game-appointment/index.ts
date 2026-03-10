"use server";

import { createSafeAction } from "@/lib/create-safe-action";
import { CreateGameAppointmentSchema } from "./schema";
import { CreateGameAppointmentResponse } from "./type";
import { db } from '@/lib/db';
import { calculateTier, calculateLockedAmount, validateAppointmentParams } from '@/lib/game-appointment-utils';
import { notifyAppointmentCreated } from '@/lib/game-appointment-notifications';
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export const createGameAppointmentAction = createSafeAction(
  CreateGameAppointmentSchema,
  async (data): Promise<CreateGameAppointmentResponse> => {
    try {
      // Get user info from cookies
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const branch = cookieStore.get("branch")?.value;

      if (!token) {
        return {
          success: false,
          error: "Bạn cần đăng nhập để tạo hẹn chơi"
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

      // Parse dates
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      
      // Calculate hours
      const hours = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
      
      // Get selected tier from database
      const tierConfig = await db.gameAppointmentTier.findFirst({
        where: {
          tierName: data.selectedTier,
          isActive: true
        }
      });

      if (!tierConfig) {
        return {
          success: false,
          error: "Tier được chọn không tồn tại hoặc đã bị vô hiệu hóa."
        };
      }
      
      // Calculate revenue (use tier-based minimum cost)
      const revenue = Number(tierConfig.lockedAmount) * tierConfig.minMembers;
      
      // Validate appointment parameters
      const validation = await validateAppointmentParams({
        members: tierConfig.minMembers,
        hours,
        // revenue,
        startTime,
        endTime
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(", ")
        };
      }

      const tier = {
        tierName: tierConfig.tierName,
        promotion: tierConfig.questName,
        description: `Quest ${tierConfig.questName}`,
        businessLogic: "Tier-based rewards",
        minNetProfit: Number(tierConfig.lockedAmount) * tierConfig.minMembers
      };

      // Calculate locked amount for creator (default values since members will choose their own)
      const lockedAmount = 0; // Members will set their own locked amount when joining

        // Create appointment with tier-based member info
        const appointment = await db.gameAppointment.create({
          data: {
            creatorId: userId,
            branch,
            title: data.title,
            description: data.description,
            game: data.game,
            gameType: data.gameType,
            rankLevel: data.rankLevel,
            startTime,
            endTime,
            minMembers: tierConfig.minMembers, // Use tier's min members
            maxMembers: tierConfig.maxMembers || tierConfig.minMembers + 2, // Use tier's max members
            minCost: Number(tierConfig.lockedAmount) * tierConfig.minMembers,
            currentMembers: 1, // Creator is automatically a member
            status: "ACTIVE",
            tierId: tierConfig.id, // Use tierId instead of tier
            totalLockedAmount: lockedAmount
          }
        });

      // Add creator as first member
      await db.gameAppointmentMember.create({
        data: {
          appointmentId: appointment.id,
          userId,
          branch,
          lockedAmount,
          status: "JOINED"
        }
      });

      // Send notification
      await notifyAppointmentCreated(appointment.id, userId, {
        title: appointment.title,
        game: appointment.game,
        startTime: appointment.startTime,
        tier: tierConfig.tierName,
        promotion: tier
      });

      return {
        success: true,
        data: {
          id: appointment.id,
          title: appointment.title,
          game: appointment.game,
          gameType: appointment.gameType,
          startTime: appointment.startTime.toISOString(),
          endTime: appointment.endTime.toISOString(),
          minMembers: appointment.minMembers,
          maxMembers: appointment.maxMembers,
          minCost: Number(appointment.minCost),
          currentMembers: appointment.currentMembers,
          status: appointment.status,
          tier: tierConfig.tierName,
          totalLockedAmount: Number(appointment.totalLockedAmount),
          promotion: {
            promotion: tier.promotion,
            description: tier.description,
            businessLogic: tier.businessLogic,
            minNetProfit: tier.minNetProfit
          }
        }
      };

    } catch (error) {
      console.error("Error creating game appointment:", error);
      return {
        success: false,
        error: "Có lỗi xảy ra khi tạo hẹn chơi. Vui lòng thử lại."
      };
    }
  }
);
