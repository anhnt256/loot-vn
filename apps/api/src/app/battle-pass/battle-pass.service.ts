import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getOrCreateUserBattlePass } from '../lib/battle-pass-creation';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';
import { calculateLevel } from '../lib/battle-pass-utils';
import { getFnetDB } from '../lib/db';

@Injectable()
export class BattlePassService {
  constructor(private readonly prisma: PrismaService) {}

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getProgress(userId: number, branch: string) {
    try {
      const currentSeasons = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM BattlePassSeason 
        WHERE isActive = true
          AND startDate <= DATE(${getCurrentTimeVNDB()})
          AND endDate >= DATE(${getCurrentTimeVNDB()})
        LIMIT 1
      `;

      const currentSeason = currentSeasons[0];
      if (!currentSeason) {
        throw new NotFoundException('No active season found');
      }

      const userProgress = await getOrCreateUserBattlePass({
        userId,
        seasonId: currentSeason.id,
        branch,
        maxLevel: currentSeason.maxLevel,
        initialExperience: 0,
      });

      if (!userProgress) {
        throw new BadRequestException(
          'Failed to create or retrieve user progress',
        );
      }

      const pendingOrderResult = await this.prisma.$queryRaw<any[]>`
        SELECT o.id, o.createdAt, o.price
        FROM BattlePassPremiumOrder o
        INNER JOIN BattlePassPremiumPackage p ON o.packageId = p.id
        WHERE o.userId = ${userId}
          AND o.branch = ${branch}
          AND p.seasonId = ${currentSeason.id}
          AND o.status = 'PENDING'
        LIMIT 1
      `;

      const hasPendingOrder = pendingOrderResult.length > 0;
      const pendingOrder = hasPendingOrder
        ? {
            id: Number(pendingOrderResult[0].id),
            createdAt: pendingOrderResult[0].createdAt,
            price: Number(pendingOrderResult[0].price),
          }
        : null;

      const claimedRewards = await this.prisma.$queryRaw<any[]>`
        SELECT rewardId FROM UserBattlePassReward 
        WHERE userId = ${userId} AND seasonId = ${currentSeason.id} AND branch = ${branch}
      `;
      const claimedRewardIds = claimedRewards.map((r) => r.rewardId);

      const allRewards = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM BattlePassReward 
        WHERE seasonId = ${currentSeason.id}
        ORDER BY level ASC
      `;

      const availableRewards = allRewards.filter(
        (reward) =>
          !claimedRewardIds.includes(reward.id) &&
          userProgress.experience >= reward.experience,
      );

      return {
        seasonId: currentSeason.id,
        isPremium: userProgress.isPremium,
        hasPendingOrder,
        pendingOrder,
        level: userProgress.level,
        experience: userProgress.experience,
        totalSpent: userProgress.totalSpent,
        claimedRewards: claimedRewardIds,
        rewards: allRewards,
        availableRewards,
        maxLevel: currentSeason.maxLevel,
      };
    } catch (error: any) {
      console.error('Error fetching user progress:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }

  async syncProgress(userId: number, branch: string) {
    return this.getProgress(userId, branch);
  }

  async updateProgress(
    userId: number,
    branch: string,
    experience?: number,
    totalSpent?: number,
  ) {
    try {
      const currentSeasons = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM BattlePassSeason 
          WHERE isActive = true
            AND startDate <= DATE(${getCurrentTimeVNDB()})
            AND endDate >= DATE(${getCurrentTimeVNDB()})
          LIMIT 1
        `;
      const currentSeason = currentSeasons[0];
      if (!currentSeason) {
        throw new NotFoundException('No active season found');
      }

      let userProgress = await getOrCreateUserBattlePass({
        userId,
        seasonId: currentSeason.id,
        branch,
        maxLevel: currentSeason.maxLevel,
        initialExperience: experience || 0,
      });

      const newExperience =
        experience !== undefined ? experience : userProgress.experience;
      const newTotalSpent =
        totalSpent !== undefined ? totalSpent : userProgress.totalSpent;
      const newLevel = calculateLevel(newExperience, currentSeason.maxLevel);

      if (
        newExperience !== userProgress.experience ||
        newTotalSpent !== userProgress.totalSpent ||
        newLevel !== userProgress.level
      ) {
        await this.prisma.$executeRaw`
            UPDATE UserBattlePass 
            SET experience = ${newExperience}, level = ${newLevel}, totalSpent = ${newTotalSpent}, updatedAt = ${getCurrentTimeVNDB()}
            WHERE id = ${userProgress.id}
          `;

        const updatedProgress = await this.prisma.$queryRaw<any[]>`
            SELECT * FROM UserBattlePass WHERE id = ${userProgress.id} LIMIT 1
          `;
        userProgress = updatedProgress[0];
      }

      return {
        success: true,
        experience: userProgress.experience,
        level: userProgress.level,
        totalSpent: userProgress.totalSpent,
      };
    } catch (error: any) {
      console.error('Error updating battle pass progress:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }

  async updateSpending(userId: number, branch: string) {
    try {
      const fnetDB = await getFnetDB(branch);
      const currentSeasons = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM BattlePassSeason 
          WHERE isActive = true
            AND startDate <= DATE(${getCurrentTimeVNDB()})
            AND endDate >= DATE(${getCurrentTimeVNDB()})
          LIMIT 1
        `;
      const currentSeason = currentSeasons[0];
      if (!currentSeason) {
        throw new NotFoundException('No active season found');
      }

      const result = await fnetDB.$queryRaw<any[]>`
          SELECT SUM(Amount) as totalSpending
          FROM fnet.ordertb
          WHERE UserId = ${userId}
            AND DATE(OrderDate) = CURDATE()
            AND Status = 1
        `;
      const totalSpending = Number(result[0]?.totalSpending || 0);

      const existingProgress = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM UserBattlePass 
          WHERE userId = ${userId} AND seasonId = ${currentSeason.id} AND branch = ${branch}
          LIMIT 1
        `;

      let userProgress;
      if (existingProgress.length > 0) {
        await this.prisma.$executeRaw`
            UPDATE UserBattlePass 
            SET totalSpent = ${totalSpending}, updatedAt = ${getCurrentTimeVNDB()}
            WHERE userId = ${userId} AND seasonId = ${currentSeason.id} AND branch = ${branch}
          `;
        const updatedProgress = await this.prisma.$queryRaw<any[]>`
            SELECT * FROM UserBattlePass WHERE id = ${existingProgress[0].id} LIMIT 1
          `;
        userProgress = updatedProgress[0];
      } else {
        const initialLevel = calculateLevel(0, currentSeason.maxLevel);
        await this.prisma.$executeRaw`
                INSERT INTO UserBattlePass (userId, seasonId, level, experience, isPremium, totalSpent, branch, createdAt, updatedAt)
                VALUES (${userId}, ${currentSeason.id}, ${initialLevel}, 0, false, ${totalSpending}, ${branch}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
            `;
        const newProgress = await this.prisma.$queryRaw<any[]>`
                SELECT * FROM UserBattlePass WHERE userId = ${userId} AND seasonId = ${currentSeason.id} AND branch = ${branch} LIMIT 1
            `;
        userProgress = newProgress[0];
      }

      return {
        success: true,
        totalSpent: userProgress.totalSpent,
      };
    } catch (error: any) {
      console.error('Error updating battle pass spending:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }

  async claimReward(userId: number, branch: string, rewardId: number) {
    try {
      const currentSeasons = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM BattlePassSeason 
          WHERE isActive = true
            AND startDate <= DATE(${getCurrentTimeVNDB()})
            AND endDate >= DATE(${getCurrentTimeVNDB()})
          LIMIT 1
        `;

      const currentSeason = currentSeasons[0];
      if (!currentSeason) {
        throw new NotFoundException('No active season found');
      }

      const rewards = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM BattlePassReward 
          WHERE seasonId = ${currentSeason.id}
          ORDER BY level ASC
        `;
      const reward = rewards.find((r: any) => r.id === rewardId);
      if (!reward) {
        throw new NotFoundException('Reward not found');
      }

      const userProgressResult = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM UserBattlePass 
          WHERE userId = ${userId} AND seasonId = ${currentSeason.id} AND branch = ${branch}
          LIMIT 1
        `;
      const userProgress = userProgressResult[0];
      if (!userProgress) {
        throw new NotFoundException('No progress found for this season');
      }

      const claimedRewardResult = await this.prisma.$queryRaw<any[]>`
          SELECT * FROM UserBattlePassReward 
          WHERE userId = ${userId} AND seasonId = ${currentSeason.id} AND rewardId = ${rewardId} AND branch = ${branch}
          LIMIT 1
        `;
      if (claimedRewardResult[0]) {
        throw new BadRequestException('Reward already claimed');
      }

      if (userProgress.experience < reward.experience) {
        throw new BadRequestException(
          `Not enough XP to claim this reward. Required: ${reward.experience}, Current: ${userProgress.experience}`,
        );
      }

      if (reward.type === 'premium' && !userProgress.isPremium) {
        throw new BadRequestException('Premium required for this reward');
      }

      if (reward.rewardType === 'stars' && reward.rewardValue) {
        const userCheck = await this.prisma.$queryRaw<any[]>`
            SELECT id FROM User WHERE userId = ${userId} AND branch = ${branch} LIMIT 1
          `;
        if (!userCheck?.length) {
          throw new BadRequestException(
            'User record not found for this branch.',
          );
        }
      }

      let promotionCodeData = null;
      await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
            INSERT INTO UserBattlePassReward (userId, seasonId, rewardId, branch, claimedAt)
            VALUES (${userId}, ${currentSeason.id}, ${rewardId}, ${branch}, ${getCurrentTimeVNDB()})
          `;

        if (reward.rewardType === 'stars' && reward.rewardValue > 0) {
          const userResult = await tx.$queryRaw<any[]>`
              SELECT id, stars FROM User WHERE userId = ${userId} AND branch = ${branch} LIMIT 1 FOR UPDATE
            `;
          const user = userResult[0];
          const oldStars = Number(user.stars) || 0;
          const newStars = oldStars + Number(reward.rewardValue);

          await tx.$executeRaw`
              UPDATE User SET stars = ${newStars}, updatedAt = ${getCurrentTimeVNDB()} WHERE id = ${user.id}
            `;
          await tx.$executeRaw`
              INSERT INTO UserStarHistory (userId, oldStars, newStars, type, createdAt, branch)
              VALUES (${userId}, ${oldStars}, ${newStars}, 'BATTLE_PASS', ${getCurrentTimeVNDB()}, ${branch})
            `;
        }

        if (reward.eventRewardId) {
          const randomCode = this.generateRandomCode();
          const promotionCode = `BP_${currentSeason.id}_${reward.level}_${randomCode}`;
          const eventRewardResult = await tx.$queryRaw<any[]>`
              SELECT * FROM EventReward WHERE id = ${reward.eventRewardId} LIMIT 1
            `;
          const eventReward = eventRewardResult[0];

          if (eventReward) {
            const rewardConfig = eventReward.rewardConfig
              ? JSON.parse(eventReward.rewardConfig)
              : {};
            const actualValue =
              rewardConfig.value ||
              rewardConfig.discountAmount ||
              rewardConfig.freeValue ||
              null;
            const expirationDate = new Date(currentSeason.endDate);
            expirationDate.setDate(expirationDate.getDate() + 30);
            const shortName =
              `BP Lv${reward.level} ${eventReward.name || 'Reward'}`.substring(
                0,
                45,
              );

            const createdPromotionCode = await (tx as any).promotionCode.create(
              {
                data: {
                  name: shortName,
                  code: promotionCode,
                  value: actualValue,
                  branch: branch,
                  isUsed: false,
                  eventId: eventReward.eventId || null,
                  rewardType: eventReward.rewardType,
                  rewardValue: actualValue,
                  expirationDate: expirationDate,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              },
            );

            promotionCodeData = {
              id: createdPromotionCode.id,
              code: promotionCode,
              name: createdPromotionCode.name,
              rewardType: eventReward.rewardType,
              rewardValue: actualValue,
              expirationDate: expirationDate,
            };

            if (eventReward.eventId) {
              const epResult = await tx.$queryRaw<any[]>`
                  SELECT * FROM EventParticipant WHERE userId = ${userId} AND eventId = ${eventReward.eventId} AND branch = ${branch} LIMIT 1 FOR UPDATE
                `;
              const rewardData = {
                rewardId: reward.eventRewardId,
                promotionCodeId: createdPromotionCode.id,
                claimedAt: getCurrentTimeVNDB(),
                source: 'BATTLE_PASS',
                level: reward.level,
                seasonId: currentSeason.id,
              };

              if (epResult.length > 0) {
                const participant = epResult[0];
                let rewardsReceived = [];
                try {
                  rewardsReceived = participant.rewardsReceived
                    ? JSON.parse(participant.rewardsReceived)
                    : [];
                } catch (e) {
                  rewardsReceived = [];
                }
                rewardsReceived.push(rewardData);
                await tx.$executeRaw`
                    UPDATE EventParticipant SET rewardsReceived = ${JSON.stringify(rewardsReceived)} WHERE id = ${participant.id}
                  `;
              } else {
                await tx.$executeRaw`
                    INSERT INTO EventParticipant (eventId, userId, branch, registeredAt, rewardsReceived)
                    VALUES (${eventReward.eventId}, ${userId}, ${branch}, ${getCurrentTimeVNDB()}, ${JSON.stringify([rewardData])})
                  `;
              }
            }
          }
        }
      });

      return {
        success: true,
        message: 'Reward claimed successfully',
        reward,
        starsAdded:
          reward.rewardType === 'stars' ? Number(reward.rewardValue) || 0 : 0,
        promotionCode: promotionCodeData,
      };
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }
}
