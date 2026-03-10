import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getFnetDB, getFnetPrisma } from '../lib/db';
import {
  getCurrentDateVNString,
  getStartOfDayVNISO,
} from '../lib/timezone-utils';
import { calculateMissionUsageHours } from '../lib/battle-pass-utils';

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number, branch: string) {
    const missions = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Mission ORDER BY id ASC`,
    );
    const curDate = getCurrentDateVNString();
    const todayStartISO = getStartOfDayVNISO();

    const userCompletions = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM UserMissionCompletion WHERE userId = ? AND branch = ? AND createdAt >= ?`,
      userId,
      branch,
      todayStartISO,
    );

    const completedIds = new Set(userCompletions.map((c) => c.missionId));

    // Fnet data
    const fnetDB = await getFnetDB(branch);
    const playSessions = await fnetDB.$queryRawUnsafe<any[]>(
      `SELECT * FROM fnet.systemlogtb WHERE UserId = ? AND status = 3
       AND (EnterDate = ? OR EndDate = ? OR (EnterDate = DATE_SUB(?, INTERVAL 1 DAY) AND EndDate = ?))`,
      userId,
      curDate,
      curDate,
      curDate,
      curDate,
    );

    const orderPayments = await fnetDB.$queryRawUnsafe<any[]>(
      `SELECT SUM(ABS(AutoAmount)) as total FROM fnet.paymenttb 
       WHERE PaymentType = 4 AND UserId = ? AND Note LIKE N'%Thời gian phí (cấn trừ từ ffood%' AND ServeDate = ?`,
      userId,
      curDate,
    );
    const orderProgress = parseFloat(orderPayments[0]?.total || 0);

    const topupPayments = await fnetDB.$queryRawUnsafe<any[]>(
      `SELECT SUM(AutoAmount) as total FROM fnet.paymenttb 
       WHERE PaymentType = 4 AND UserId = ? AND Note NOT LIKE N'%Thời gian phí (cấn trừ từ ffood%' AND ServeDate = ?`,
      userId,
      curDate,
    );
    const topupProgress = parseFloat(topupPayments[0]?.total || 0);

    return missions.map((mission) => {
      const isCompleted = completedIds.has(mission.id);
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

      return {
        ...mission,
        isCompleted,
        progress: {
          actual: actualValue,
          required: mission.quantity,
          percentage: Math.min((actualValue / mission.quantity) * 100, 100),
          canClaim: !isCompleted && actualValue >= mission.quantity,
        },
      };
    });
  }
}
