import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getFnetDB, getFnetPrisma } from '../lib/db';
import {
  getStartOfDayVNISO,
  getCurrentDateVNString,
  getCurrentTimeVNDB,
} from '../lib/timezone-utils';
import {
  calculateMissionUsageHours,
  calculateLevel,
} from '../lib/battle-pass-utils';

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number, branch: string) {
    try {
      const missions = await this.prisma.mission.findMany({
        orderBy: { id: 'asc' },
      });

      const todayStartISO = getStartOfDayVNISO();
      const userCompletions = await this.prisma.userMissionCompletion.findMany({
        where: {
          userId,
          branch,
          createdAt: { gte: new Date(todayStartISO) },
        },
      });

      const completedMissionIds = new Set(
        userCompletions.map((c) => c.missionId),
      );

      const fnetDB = await getFnetDB(branch);
      const fnetPrisma = await getFnetPrisma(branch);
      const curDate = getCurrentDateVNString();

      let playSessions: any[] = [];
      try {
        playSessions = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
          SELECT *
          FROM fnet.systemlogtb
          WHERE UserId = ${userId}
            AND status = 3
            AND (
              EnterDate = ${curDate} 
              OR EndDate = ${curDate}
              OR (EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY) AND EndDate = ${curDate})
              OR (EndDate IS NULL AND EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY))
            )
          LIMIT 1000
        `);
      } catch (error) {
        console.error('Error fetching play sessions:', error);
      }

      let orderProgress = 0;
      let topupProgress = 0;

      try {
        const orderPayments = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
          SELECT COALESCE(CAST(SUM(ABS(AutoAmount)) AS DECIMAL(18,2)), 0) AS total
          FROM fnet.paymenttb
          WHERE PaymentType = 4
            AND UserId = ${userId}
            AND Note LIKE N'%Thời gian phí (cấn trừ từ ffood%'
            AND ServeDate = ${curDate}
        `);
        orderProgress = parseFloat(orderPayments[0]?.total?.toString() || '0');

        const topupPayments = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
          SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
          FROM fnet.paymenttb
          WHERE PaymentType = 4
            AND UserId = ${userId}
            AND Note NOT LIKE N'%Thời gian phí (cấn trừ từ ffood%'
            AND ServeDate = ${curDate}
        `);
        topupProgress = parseFloat(topupPayments[0]?.total?.toString() || '0');
      } catch (error) {
        console.error('Error fetching payment data:', error);
      }

      return missions.map((mission) => {
        const isCompleted = completedMissionIds.has(mission.id);
        let actualValue = 0;
        switch (mission.type) {
          case 'HOURS':
            actualValue = calculateMissionUsageHours(
              playSessions,
              curDate,
              mission.startHours,
              mission.endHours,
            );
            break;
          case 'ORDER':
            actualValue = orderProgress;
            break;
          case 'TOPUP':
            actualValue = topupProgress;
            break;
        }

        const canClaim = !isCompleted && actualValue >= mission.quantity;

        return {
          ...mission,
          userCompletion: isCompleted
            ? {
                id:
                  userCompletions.find((c) => c.missionId === mission.id)?.id ||
                  0,
                isDone: true,
                createdAt:
                  userCompletions.find((c) => c.missionId === mission.id)
                    ?.createdAt || new Date(),
                updatedAt:
                  userCompletions.find((c) => c.missionId === mission.id)
                    ?.updatedAt || new Date(),
              }
            : null,
          progress: {
            actual: actualValue,
            required: mission.quantity,
            percentage: Math.min((actualValue / mission.quantity) * 100, 100),
            canClaim: canClaim,
          },
        };
      });
    } catch (error: any) {
      console.error('Error fetching missions:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }

  async claim(userId: number, branch: string, missionId: number) {
    try {
      const mission = await this.prisma.mission.findUnique({
        where: { id: missionId },
      });

      if (!mission) {
        throw new NotFoundException('Mission not found');
      }

      const today = getStartOfDayVNISO();
      const existingCompletion =
        await this.prisma.userMissionCompletion.findFirst({
          where: {
            userId,
            missionId,
            branch,
            createdAt: { gte: new Date(today) },
          },
        });

      if (existingCompletion) {
        throw new BadRequestException('Mission already completed today');
      }

      const fnetDB = await getFnetDB(branch);
      const fnetPrisma = await getFnetPrisma(branch);
      const curDate = getCurrentDateVNString();

      let missionCompleted = false;
      let actualValue = 0;

      switch (mission.type) {
        case 'HOURS': {
          const playSessions = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
            SELECT *
            FROM fnet.systemlogtb
            WHERE UserId = ${userId}
              AND status = 3
              AND (
                EnterDate = ${curDate} 
                OR EndDate = ${curDate}
                OR (EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY) AND EndDate = ${curDate})
                OR (EndDate IS NULL AND EnterDate = DATE_SUB(${curDate}, INTERVAL 1 DAY))
              )
          `);
          actualValue = calculateMissionUsageHours(
            playSessions,
            curDate,
            mission.startHours,
            mission.endHours,
          );
          missionCompleted = actualValue >= mission.quantity;
          break;
        }
        case 'ORDER': {
          const orderPayments = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
            SELECT COALESCE(CAST(SUM(ABS(AutoAmount)) AS DECIMAL(18,2)), 0) AS total
            FROM fnet.paymenttb
            WHERE PaymentType = 4
              AND UserId = ${userId}
              AND Note LIKE N'%Thời gian phí (cấn trừ từ ffood%'
              AND ServeDate = ${curDate}
          `);
          actualValue = parseFloat(orderPayments[0]?.total?.toString() || '0');
          missionCompleted = actualValue >= mission.quantity;
          break;
        }
        case 'TOPUP': {
          const topupPayments = await fnetDB.$queryRaw<any[]>(fnetPrisma.sql`
            SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
            FROM fnet.paymenttb
            WHERE PaymentType = 4
              AND UserId = ${userId}
              AND Note NOT LIKE N'%Thời gian phí (cấn trừ từ ffood%'
              AND ServeDate = ${curDate}
          `);
          actualValue = parseFloat(topupPayments[0]?.total?.toString() || '0');
          missionCompleted = actualValue >= mission.quantity;
          break;
        }
        default:
          throw new BadRequestException('Unsupported mission type');
      }

      if (!missionCompleted) {
        throw new BadRequestException('Mission requirements not met');
      }

      const currentTime = getCurrentTimeVNDB();

      const result: any = await this.prisma.$transaction(async (tx) => {
        const completion = await tx.userMissionCompletion.create({
          data: {
            userId,
            missionId,
            branch,
            completedAt: new Date(currentTime),
            actualValue,
            createdAt: new Date(currentTime),
            updatedAt: new Date(currentTime),
          },
        });

        const currentSeasonResult = await tx.$queryRaw<any[]>`
          SELECT * FROM BattlePassSeason 
          WHERE isActive = true 
            AND startDate <= DATE(${currentTime}) 
            AND endDate >= DATE(${currentTime})
          LIMIT 1
        `;

        if (currentSeasonResult.length > 0) {
          const season = currentSeasonResult[0];
          let userProgressResult = await tx.$queryRaw<any[]>`
            SELECT * FROM UserBattlePass 
            WHERE userId = ${userId} AND seasonId = ${season.id} AND branch = ${branch}
            LIMIT 1 FOR UPDATE
          `;

          if (userProgressResult.length === 0) {
            await tx.$executeRaw`
                INSERT INTO UserBattlePass (userId, seasonId, branch, experience, level, isPremium, createdAt, updatedAt)
                VALUES (${userId}, ${season.id}, ${branch}, 0, 0, false, ${currentTime}, ${currentTime})
            `;
            userProgressResult = await tx.$queryRaw<any[]>`
                SELECT * FROM UserBattlePass WHERE userId = ${userId} AND seasonId = ${season.id} AND branch = ${branch} LIMIT 1
            `;
          }

          const progress = userProgressResult[0];
          const newExperience = (progress.experience || 0) + mission.reward;
          const newLevel = calculateLevel(newExperience, season.maxLevel);

          await tx.$executeRaw`
            UPDATE UserBattlePass 
            SET experience = ${newExperience}, level = ${newLevel}, updatedAt = ${currentTime}
            WHERE id = ${progress.id}
          `;
        }

        return {
          success: true,
          message: 'Mission completed successfully',
          xpReward: mission.reward,
          completionId: completion.id,
        };
      });

      return result;
    } catch (error: any) {
      console.error('Error claiming mission:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }
}
