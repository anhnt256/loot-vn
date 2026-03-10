import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';
import { getOrCreateUserBattlePass } from '../lib/battle-pass-creation';

@Injectable()
export class BattlePassService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentSeason() {
    const seasons = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM BattlePassSeason 
       WHERE isActive = true AND startDate <= DATE(?) AND endDate >= DATE(?) LIMIT 1`,
      getCurrentTimeVNDB(),
      getCurrentTimeVNDB(),
    );
    if (!seasons.length) return null;

    const season = seasons[0];
    const rewards = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT bpr.*, er.rewardType as eventRewardType, er.rewardConfig as eventRewardConfig
       FROM BattlePassReward bpr
       LEFT JOIN EventReward er ON bpr.eventRewardId = er.id
       WHERE bpr.seasonId = ? ORDER BY bpr.level ASC`,
      season.id,
    );

    return { ...season, rewards };
  }

  async syncProgress(userId: number, branch: string) {
    const season = await this.getCurrentSeason();
    if (!season) throw new NotFoundException('No active season found');

    const progress = await getOrCreateUserBattlePass({
      userId,
      seasonId: season.id,
      branch,
      maxLevel: season.maxLevel || 100,
    });

    return progress;
  }
}
