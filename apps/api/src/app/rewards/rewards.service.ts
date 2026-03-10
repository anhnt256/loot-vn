import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getFnetDB } from '../lib/db';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';
import { updateFnetMoney } from '../lib/fnet-money-utils';

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    branch: string,
    eventId?: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    try {
      let query = `
        SELECT 
          er.id, er.name, er.description, er.rewardType as type, er.rewardConfig,
          er.maxQuantity as maxUsageCount, er.used as usageCount, er.isActive,
          er.createdAt, er.updatedAt, er.validFrom as startDate, er.validTo as endDate,
          e.branch
        FROM EventReward er
        INNER JOIN Event e ON er.eventId = e.id
        WHERE er.isActive = true AND (e.branch = '${branch}' OR e.branch = 'ALL')
      `;

      if (eventId) {
        query += ` AND er.eventId = '${eventId}'`;
      }

      query += ` ORDER BY er.createdAt DESC LIMIT ${limit} OFFSET ${offset}`;

      const rewards: any[] = await this.prisma.$queryRawUnsafe(query);

      let countQuery = `
        SELECT COUNT(*) as count 
        FROM EventReward er
        INNER JOIN Event e ON er.eventId = e.id
        WHERE er.isActive = true AND (e.branch = '${branch}' OR e.branch = 'ALL')
      `;
      if (eventId) {
        countQuery += ` AND er.eventId = '${eventId}'`;
      }
      const totalCountResult: any[] =
        await this.prisma.$queryRawUnsafe(countQuery);
      const totalCount = Number(totalCountResult[0].count);

      const transformedRewards = rewards.map((reward: any) => {
        let value = 0;
        let minOrderAmount = null;
        let maxDiscountAmount = null;
        let itemType = null;

        try {
          const config = JSON.parse(reward.rewardConfig);
          value =
            config.value || config.discountAmount || config.freeQuantity || 0;
          minOrderAmount = config.minOrderAmount || null;
          maxDiscountAmount = config.maxDiscountAmount || null;
          itemType = config.itemType || null;
        } catch (e) {
          console.error('Error parsing rewardConfig:', e);
        }

        return {
          id: Number(reward.id),
          name: reward.name,
          description: reward.description || '',
          type: reward.type,
          value,
          minOrderAmount,
          maxDiscountAmount,
          isActive: Boolean(reward.isActive),
          usageCount: Number(reward.usageCount),
          maxUsageCount: reward.maxUsageCount
            ? Number(reward.maxUsageCount)
            : null,
          createdAt: reward.createdAt,
          startDate: reward.startDate,
          endDate: reward.endDate,
          itemType,
        };
      });

      return {
        success: true,
        rewards: transformedRewards,
        totalCount,
        pagination: { limit, offset, hasMore: rewards.length === limit },
      };
    } catch (error: any) {
      console.error('Error fetching rewards:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }

  async create(branch: string, data: any) {
    const {
      eventId,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      maxUsageCount,
      itemType,
      isActive,
    } = data;

    if (!name || !type || value === undefined || !eventId) {
      throw new BadRequestException(
        'Name, type, value, and eventId are required',
      );
    }

    const rewardConfig: any = { value };
    if (minOrderAmount !== undefined)
      rewardConfig.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined)
      rewardConfig.maxDiscountAmount = maxDiscountAmount;
    if (itemType) rewardConfig.itemType = itemType;

    const now = getCurrentTimeVNDB();

    try {
      await this.prisma.$executeRaw`
        INSERT INTO EventReward (
          eventId, name, description, rewardType, rewardConfig,
          maxQuantity, used, isActive, createdAt, updatedAt
        )
        VALUES (
          ${eventId}, ${name}, ${description || null}, ${type},
          ${JSON.stringify(rewardConfig)}, ${maxUsageCount || null}, 0,
          ${isActive !== undefined ? isActive : true}, ${now}, ${now}
        )
      `;

      const createdRewardResult = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM EventReward WHERE name = ${name} AND eventId = ${eventId}
        ORDER BY createdAt DESC LIMIT 1
      `;
      const reward = createdRewardResult[0];

      return {
        success: true,
        reward: {
          id: Number(reward.id),
          name: reward.name,
          description: reward.description || '',
          type: reward.rewardType,
          value,
          isActive: Boolean(reward.isActive),
          createdAt: reward.createdAt,
          updatedAt: reward.updatedAt,
        },
      };
    } catch (error: any) {
      console.error('Error creating reward:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }

  async findPendingExchanges(branch: string, userId?: number) {
    try {
      let userFilter = '';
      let userJoin = `LEFT JOIN User u ON urm.userId = u.userId AND u.branch = '${branch}'`;

      if (userId) {
        const userResult = await this.prisma.$queryRaw<any[]>`
          SELECT userId FROM User WHERE userId = ${userId} AND branch = ${branch} LIMIT 1
        `;
        if (userResult.length > 0) {
          userFilter = `AND urm.userId = ${userResult[0].userId}`;
        }
      }

      const pendingRewards = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          urm.id, urm.userId, urm.rewardId, urm.promotionCodeId, urm.duration,
          urm.isUsed, urm.status, urm.branch, urm.createdAt, urm.updatedAt,
          urm.note, urm.type,
          pr.name as rewardName, pr.value as rewardValue, pr.starsValue as rewardStars,
          er.name as eventRewardName,
          pc.name as eventPromotionCodeName, pc.code as eventPromotionCodeCode,
          pc.rewardType as eventPromotionCodeType, pc.rewardValue as eventPromotionCodeValue,
          u.userId as userUserId, u.userName, u.stars as userStars, u.branch as userBranch
        FROM UserRewardMap urm
        LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id AND urm.type = 'STARS'
        LEFT JOIN EventReward er ON urm.rewardId = er.id AND urm.type = 'EVENT'
        LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id AND urm.type = 'EVENT'
        ${userJoin}
        WHERE urm.status = 'INITIAL' AND urm.branch = '${branch}' ${userFilter}
        ORDER BY urm.createdAt DESC
      `);

      const fnetDB = await getFnetDB(branch);
      const userIds = [
        ...new Set(pendingRewards.map((r) => r.userUserId).filter(Boolean)),
      ];

      let fnetWallets: any[] = [];
      if (userIds.length > 0) {
        fnetWallets = await fnetDB.$queryRawUnsafe<any[]>(`
          SELECT userid, main, sub FROM wallettb WHERE userid IN (${userIds.join(',')})
        `);
      }

      const fnetMoneyMap = new Map();
      fnetWallets.forEach((wallet) => {
        fnetMoneyMap.set(Number(wallet.userid), {
          main: Number(wallet.main) || 0,
          sub: Number(wallet.sub) || 0,
          total: (Number(wallet.main) || 0) + (Number(wallet.sub) || 0),
        });
      });

      const rewardIds = pendingRewards.map((r) => Number(r.id)).filter(Boolean);
      let fnetHistories: any[] = [];
      if (rewardIds.length > 0) {
        fnetHistories = await this.prisma.$queryRawUnsafe<any[]>(`
          SELECT targetId, oldMainMoney, newMainMoney, oldSubMoney, newSubMoney, type
          FROM FnetHistory
          WHERE targetId IN (${rewardIds.join(',')}) AND type IN ('REWARD', 'VOUCHER')
        `);
      }

      const fnetHistoryMap = new Map();
      fnetHistories.forEach((record) => {
        fnetHistoryMap.set(Number(record.targetId), {
          oldMain: Number(record.oldMainMoney) || 0,
          newMain: Number(record.newMainMoney) || 0,
          oldSub: Number(record.oldSubMoney) || 0,
          newSub: Number(record.newSubMoney) || 0,
          type: record.type,
        });
      });

      return pendingRewards.map((reward) => {
        const uId = Number(reward.userUserId);
        const walletInfo = fnetMoneyMap.get(uId) || {
          main: 0,
          sub: 0,
          total: 0,
        };
        const historyInfo = fnetHistoryMap.get(Number(reward.id));

        const baseData = {
          id: reward.id,
          promotionCodeId: reward.promotionCodeId,
          duration: reward.duration,
          isUsed: reward.isUsed,
          status: reward.status,
          branch: reward.branch,
          createdAt: reward.createdAt,
          note: reward.note,
          type: reward.type,
          user: {
            userId: reward.userUserId,
            userName: reward.userName,
            stars: reward.userStars,
            afterExchangeStars: reward.userStars - (reward.rewardStars || 0),
            branch: reward.userBranch,
            fnetMain: historyInfo ? historyInfo.oldMain : walletInfo.main,
            fnetSub: historyInfo ? historyInfo.oldSub : walletInfo.sub,
            fnetMainAfter: historyInfo ? historyInfo.newMain : undefined,
            fnetSubAfter: historyInfo ? historyInfo.newSub : undefined,
          },
        };

        if (reward.type === 'EVENT') {
          return {
            ...baseData,
            reward: {
              id: reward.rewardId,
              name:
                reward.eventPromotionCodeName ||
                reward.eventRewardName ||
                'Phần thưởng Event',
              type: reward.eventPromotionCodeType,
              code: reward.eventPromotionCodeCode,
              value: reward.eventPromotionCodeValue || null,
            },
          };
        } else {
          return {
            ...baseData,
            reward: {
              id: reward.rewardId,
              name: reward.rewardName,
              value: reward.rewardValue,
              stars: reward.rewardStars,
            },
          };
        }
      });
    } catch (error: any) {
      console.error('Error fetching pending exchanges:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }

  async processExchange(
    branch: string,
    rewardMapId: number,
    action: 'APPROVE' | 'REJECT',
    note?: string,
  ) {
    try {
      const rewardMapResult = await this.prisma.$queryRaw<any[]>`
        SELECT id, userId, type, promotionCodeId, rewardId, status FROM UserRewardMap 
        WHERE id = ${rewardMapId} AND branch = ${branch} AND status = 'INITIAL' LIMIT 1
      `;
      if (rewardMapResult.length === 0)
        throw new NotFoundException('Exchange not found or processed');
      const rewardMap = rewardMapResult[0];

      const userResult = await this.prisma.$queryRaw<any[]>`
        SELECT id, userId, stars FROM User WHERE userId = ${rewardMap.userId} AND branch = ${branch} LIMIT 1
      `;
      if (userResult.length === 0)
        throw new NotFoundException('User not found');
      const user = userResult[0];

      await this.prisma.$transaction(async (tx) => {
        const lockedRewardMap = await tx.$queryRaw<any[]>`
          SELECT 
            urm.*, pr.name as rewardName, pr.value as rewardValue, pr.starsValue as rewardStars,
            pc.code as eventPromotionCode, pc.rewardType as eventRewardType, pc.rewardValue as eventRewardValue
          FROM UserRewardMap urm
          LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id AND urm.type = 'STARS'
          LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id AND urm.type = 'EVENT'
          WHERE urm.id = ${rewardMapId} AND urm.status = 'INITIAL' LIMIT 1 FOR UPDATE
        `;

        if (lockedRewardMap.length === 0)
          throw new Error('Race condition: already processed');

        await tx.$executeRaw`
          UPDATE UserRewardMap SET status = ${action}, note = ${note || null}, updatedAt = ${getCurrentTimeVNDB()}
          WHERE id = ${rewardMapId}
        `;

        if (action === 'APPROVE') {
          await tx.$executeRaw`UPDATE UserRewardMap SET isUsed = true WHERE id = ${rewardMapId}`;
          const rMapped = lockedRewardMap[0];

          if (rMapped.type === 'EVENT') {
            if (rMapped.promotionCodeId) {
              await tx.$executeRaw`UPDATE PromotionCode SET isUsed = true, updatedAt = NOW() WHERE id = ${rMapped.promotionCodeId}`;
            }
            if (
              (rMapped.eventRewardType === 'FREE_HOURS' ||
                rMapped.eventRewardType === 'MAIN_ACCOUNT_TOPUP') &&
              rMapped.eventRewardValue
            ) {
              await updateFnetMoney({
                userId: Number(rMapped.userId),
                branch,
                walletType:
                  rMapped.eventRewardType === 'FREE_HOURS' ? 'SUB' : 'MAIN',
                amount: Number(rMapped.eventRewardValue),
                targetId: rewardMapId,
                transactionType: 'REWARD',
                saveHistory: false,
              });
            }
          } else {
            // STARS
            await tx.$executeRaw`
              INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
              VALUES (${user.userId}, 'REWARD', ${Number(user.stars) + (rMapped.rewardStars || 0)}, ${user.stars}, ${rewardMapId}, ${getCurrentTimeVNDB()}, ${branch})
            `;
            if (rMapped.rewardValue) {
              await updateFnetMoney({
                userId: Number(rMapped.userId),
                branch,
                walletType: 'SUB',
                amount: Number(rMapped.rewardValue),
                targetId: rewardMapId,
                transactionType: 'REWARD',
                saveHistory: false,
              });
            }
          }
        } else {
          // REJECT
          const rMapped = lockedRewardMap[0];
          if (rMapped.type === 'EVENT' && rMapped.promotionCodeId) {
            await tx.$executeRaw`UPDATE PromotionCode SET isUsed = false WHERE id = ${rMapped.promotionCodeId}`;
          } else if (rMapped.type === 'STARS' && rMapped.rewardStars) {
            await tx.$executeRaw`UPDATE User SET stars = stars + ${Number(rMapped.rewardStars)}, updatedAt = ${getCurrentTimeVNDB()} WHERE id = ${user.id}`;
          }
        }
      });

      return {
        success: true,
        message: `Reward exchange ${action.toLowerCase()}d successfully`,
      };
    } catch (error: any) {
      console.error('Error processing exchange:', error);
      throw new BadRequestException(error.message || 'Internal server error');
    }
  }
}
