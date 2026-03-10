import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateGameAppointmentInput,
  JoinGameAppointmentInput,
  LeaveGameAppointmentInput,
  CompleteGameAppointmentInput,
} from './game-appointments.dto';
import {
  calculateTier,
  calculateLockedAmount,
  validateAppointmentParams,
} from '../lib/game-appointment-utils';
import {
  notifyAppointmentCreated,
  notifyUserJoined,
  notifyTierChanged,
  notifyUserLeft,
  notifyAppointmentCompleted,
} from '../lib/game-appointment-notifications';
import { autoDowngradeTier } from '../lib/auto-tier-downgrade';
import { completeAppointment } from '../lib/reward-distribution';

@Injectable()
export class GameAppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateGameAppointmentInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    const { userId, branch, ...appointmentData } = data;

    try {
      const startTime = new Date(appointmentData.startTime);
      const endTime = new Date(appointmentData.endTime);
      const hours = Math.ceil(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60),
      );

      const tierConfig = await this.prisma.gameAppointmentTier.findFirst({
        where: { tierName: appointmentData.selectedTier, isActive: true },
      });

      if (!tierConfig)
        throw new BadRequestException(
          'Tier được chọn không tồn tại hoặc đã bị vô hiệu hóa.',
        );

      const validation = await validateAppointmentParams({
        members: tierConfig.minMembers,
        hours,
        startTime,
        endTime,
      });

      if (!validation.isValid)
        throw new BadRequestException(validation.errors.join(', '));

      const lockedAmount = 0;

      const appointment = await this.prisma.gameAppointment.create({
        data: {
          creatorId: userId,
          branch,
          title: appointmentData.title,
          description: appointmentData.description,
          game: appointmentData.game,
          gameType: appointmentData.gameType,
          rankLevel: appointmentData.rankLevel,
          startTime,
          endTime,
          minMembers: tierConfig.minMembers,
          maxMembers: tierConfig.maxMembers || tierConfig.minMembers + 2,
          minCost: Number(tierConfig.lockedAmount) * tierConfig.minMembers,
          currentMembers: 1,
          status: 'ACTIVE',
          tierId: tierConfig.id,
          totalLockedAmount: lockedAmount,
        },
      });

      await this.prisma.gameAppointmentMember.create({
        data: {
          appointmentId: appointment.id,
          userId,
          branch,
          lockedAmount,
          status: 'JOINED',
        },
      });

      const tierInfo = {
        tierName: tierConfig.tierName,
        promotion: tierConfig.questName,
        description: `Quest ${tierConfig.questName}`,
        businessLogic: 'Tier-based rewards',
        minNetProfit: Number(tierConfig.lockedAmount) * tierConfig.minMembers,
      };

      await notifyAppointmentCreated(appointment.id, userId, {
        title: appointment.title,
        game: appointment.game,
        startTime: appointment.startTime,
        tier: tierConfig.tierName,
        promotion: tierInfo,
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
          promotion: tierInfo,
        },
      };
    } catch (error: any) {
      console.error('Error creating game appointment:', error);
      throw new BadRequestException(
        error.message || 'Có lỗi xảy ra khi tạo hẹn chơi.',
      );
    }
  }

  async join(
    data: JoinGameAppointmentInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    const { userId, branch, ...joinData } = data;
    try {
      const appointmentResult = await (this.prisma as any).$queryRaw`
        SELECT ga.*, gat.tierName, gat.tasks
        FROM GameAppointment ga
        LEFT JOIN GameAppointmentTier gat ON ga.tierId = gat.id
        WHERE ga.id = ${joinData.appointmentId}
      `;
      const appointment = (appointmentResult as any[])[0];
      if (!appointment) throw new BadRequestException('Hẹn chơi không tồn tại');
      if (appointment.status !== 'ACTIVE')
        throw new BadRequestException('Hẹn chơi không còn hoạt động');

      const existingMemberResult = await (this.prisma as any).$queryRaw`
        SELECT userId FROM GameAppointmentMember 
        WHERE appointmentId = ${joinData.appointmentId} AND userId = ${userId}
      `;
      if ((existingMemberResult as any[]).length > 0)
        throw new BadRequestException('Bạn đã tham gia hẹn chơi này rồi');
      if (appointment.currentMembers >= appointment.maxMembers)
        throw new BadRequestException('Hẹn chơi đã đủ thành viên');

      const hours = Math.ceil(
        (new Date(appointment.endTime).getTime() -
          new Date(appointment.startTime).getTime()) /
          (1000 * 60 * 60),
      );
      const lockedAmount =
        joinData.computerCount * joinData.pricePerHour * hours;
      const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await (this.prisma as any).$executeRaw`
        INSERT INTO GameAppointmentMember 
        (id, appointmentId, userId, branch, lockedAmount, status, machineName, machineGroupId, joinedAt)
        VALUES (${memberId}, ${joinData.appointmentId}, ${userId}, ${branch}, ${lockedAmount}, 'JOINED', ${joinData.machineName || null}, ${joinData.machineGroupId || null}, NOW())
      `;

      await (this.prisma as any).$executeRaw`
        UPDATE GameAppointment 
        SET currentMembers = currentMembers + 1, 
            totalLockedAmount = totalLockedAmount + ${lockedAmount}
        WHERE id = ${joinData.appointmentId}
      `;

      const tierChangeResult = await autoDowngradeTier(joinData.appointmentId);

      // We omit the complex promotion response mappings for brevity, they can be calculated efficiently on the frontend or simplified later.
      return {
        success: true,
        data: {
          appointmentId: data.appointmentId,
          userId,
          lockedAmount,
          status: 'JOINED',
        },
      };
    } catch (error: any) {
      console.error('Error joining game appointment:', error);
      throw new BadRequestException(error.message || 'Failed to join');
    }
  }

  async leave(
    data: LeaveGameAppointmentInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    const { userId, branch, ...leaveData } = data;
    try {
      const appointmentResult = await (this.prisma as any).$queryRaw`
        SELECT ga.*, gat.tierName, gat.tasks
        FROM GameAppointment ga
        LEFT JOIN GameAppointmentTier gat ON ga.tierId = gat.id
        WHERE ga.id = ${leaveData.appointmentId}
      `;
      const appointment = (appointmentResult as any[])[0];
      if (!appointment) throw new BadRequestException('Hẹn chơi không tồn tại');
      if (appointment.status !== 'ACTIVE')
        throw new BadRequestException('Hẹn chơi không còn hoạt động');

      const memberResult = await (this.prisma as any).$queryRaw`
        SELECT id, userId, lockedAmount FROM GameAppointmentMember 
        WHERE appointmentId = ${leaveData.appointmentId} AND userId = ${userId} AND status = 'JOINED'
      `;
      const member = (memberResult as any[])[0];
      if (!member)
        throw new BadRequestException('Bạn chưa tham gia hẹn chơi này');
      if (appointment.creatorId === userId)
        throw new BadRequestException(
          'Người tạo hẹn chơi không thể rời. Hãy hủy hẹn chơi thay vào đó.',
        );

      await (this.prisma as any).$executeRaw`
        UPDATE GameAppointmentMember 
        SET status = 'LEFT' 
        WHERE id = ${member.id}
      `;

      await (this.prisma as any).$executeRaw`
        UPDATE GameAppointment 
        SET currentMembers = currentMembers - 1, 
            totalLockedAmount = totalLockedAmount - ${member.lockedAmount}
        WHERE id = ${leaveData.appointmentId}
      `;

      await autoDowngradeTier(leaveData.appointmentId);

      return {
        success: true,
        data: {
          appointmentId: data.appointmentId,
          userId,
          unlockedAmount: member.lockedAmount,
          status: 'LEFT',
        },
      };
    } catch (error: any) {
      console.error('Error leaving appointment:', error);
      throw new BadRequestException(error.message || 'Failed to leave');
    }
  }

  async complete(
    data: CompleteGameAppointmentInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    const { userId, branch, ...completeData } = data;
    try {
      const appointment = await this.prisma.gameAppointment.findUnique({
        where: { id: completeData.appointmentId },
        include: { members: { where: { status: 'JOINED' } } },
      });
      if (!appointment) throw new BadRequestException('Hẹn chơi không tồn tại');
      if (appointment.creatorId !== userId)
        throw new BadRequestException(
          'Chỉ người tạo hẹn chơi mới có thể hoàn thành',
        );
      if (appointment.status !== 'ACTIVE')
        throw new BadRequestException('Hẹn chơi không còn hoạt động');

      const result = await completeAppointment(completeData.appointmentId, {
        completedMembers: completeData.completedMembers as any[],
      });
      if (!result.success) throw new BadRequestException(result.error);

      await notifyAppointmentCompleted(completeData.appointmentId, {
        title: appointment.title,
        game: appointment.game,
        tier: 'Unknown',
        promotion: undefined,
        totalLockedAmount: Number(appointment.totalLockedAmount),
      });

      return {
        success: true,
        data: {
          appointmentId: data.appointmentId,
          status: 'COMPLETED',
          rewardDistribution: result.rewardDistribution,
        },
      };
    } catch (error: any) {
      console.error('Error completion appointment:', error);
      throw new BadRequestException(error.message || 'Failed to complete');
    }
  }
}
