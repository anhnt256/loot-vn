import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getFnetDB } from '../lib/db';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';

@Injectable()
export class WelcomeRewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkReturnedUser(userId: number, branch: string) {
    const fnetDB = await getFnetDB(branch);
    const recentDates = await fnetDB.$queryRawUnsafe<any[]>(
      `SELECT EnterDate FROM systemlogtb WHERE UserId = ? AND status = 3 GROUP BY EnterDate ORDER BY EnterDate DESC LIMIT 2`,
      userId,
    );

    if (recentDates.length < 2) return { isReturned: false };

    const diff = Math.floor(
      (new Date(recentDates[0].EnterDate).getTime() -
        new Date(recentDates[1].EnterDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return { isReturned: diff >= 30, daysSinceLastSession: diff };
  }

  async getStatus(userId: number, branch: string) {
    const now = new Date();
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const fnetDB = await getFnetDB(branch);
    const paymentResult = await fnetDB.$queryRawUnsafe<any[]>(
      `SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS totalDeposit
       FROM paymenttb WHERE PaymentType = 4 AND UserId = ? AND Note = 'Thời gian phí'
       AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= ?`,
      userId,
      fourteenDaysAgo.toISOString().split('T')[0] + ' 00:00:00',
    );

    const totalDeposit = Number(paymentResult[0].totalDeposit);
    const returnedStatus = await this.checkReturnedUser(userId, branch);

    const activeEvent = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Event WHERE type = 'NEW_USER_WELCOME' AND branch = ? AND isActive = true AND startDate <= ? AND endDate >= ? LIMIT 1`,
      branch,
      getCurrentTimeVNDB(),
      getCurrentTimeVNDB(),
    );

    if (!activeEvent.length) return { event: null, rewards: [] };

    const event = activeEvent[0];
    const rewards = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM EventReward WHERE eventId = ? AND isActive = true ORDER BY priority ASC`,
      event.id,
    );

    const participant = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT rewardsReceived FROM EventParticipant WHERE eventId = ? AND userId = ? AND branch = ? LIMIT 1`,
      event.id,
      userId,
      branch,
    );

    let claimedIds = new Set();
    if (participant.length && participant[0].rewardsReceived) {
      try {
        const received = JSON.parse(participant[0].rewardsReceived);
        received.forEach((r: any) => claimedIds.add(r.id));
      } catch (e) {}
    }

    return {
      event,
      totalDeposit,
      isReturnedUser: returnedStatus.isReturned,
      rewards: rewards.map((r) => ({
        ...r,
        alreadyClaimed: claimedIds.has(r.id),
        canClaim:
          totalDeposit >= (JSON.parse(r.rewardConfig).minOrderAmount || 0) &&
          !claimedIds.has(r.id),
      })),
    };
  }
}
