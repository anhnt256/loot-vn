import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { updateFnetMoney } from '../lib/fnet-money-utils';
import { getCurrentTimeVNDB } from '../lib/timezone-utils';

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending(branch: string, userId?: number) {
    let query = `
      SELECT 
        urm.*,
        pr.name as rewardName, pr.value as rewardValue, pr.starsValue as rewardStars,
        er.name as eventRewardName,
        pc.name as eventPromotionCodeName, pc.code as eventPromotionCodeCode,
        pc.rewardType as eventPromotionCodeType, pc.rewardValue as eventPromotionCodeValue,
        u.userName, u.stars as userStars
      FROM UserRewardMap urm
      LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id AND urm.type = 'STARS'
      LEFT JOIN EventReward er ON urm.rewardId = er.id AND urm.type = 'EVENT'
      LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id AND urm.type = 'EVENT'
      LEFT JOIN User u ON urm.userId = u.userId AND u.branch = urm.branch
      WHERE urm.status = 'INITIAL' AND urm.branch = ?
    `;
    const params: any[] = [branch];

    if (userId) {
      query += ` AND urm.userId = ?`;
      params.push(userId);
    }

    query += ` ORDER BY urm.createdAt DESC`;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  async approve(
    id: number,
    branch: string,
    action: 'APPROVE' | 'REJECT',
    note?: string,
  ) {
    const rewardMapResult = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT urm.*, pr.starsValue as rewardStars, pr.value as rewardValue, 
              pc.rewardType as eventRewardType, pc.rewardValue as eventRewardValue, pc.id as pcId
       FROM UserRewardMap urm
       LEFT JOIN PromotionReward pr ON urm.promotionCodeId = pr.id AND urm.type = 'STARS'
       LEFT JOIN PromotionCode pc ON urm.promotionCodeId = pc.id AND urm.type = 'EVENT'
       WHERE urm.id = ? AND urm.branch = ? AND urm.status = 'INITIAL' LIMIT 1`,
      id,
      branch,
    );

    if (rewardMapResult.length === 0)
      throw new NotFoundException(
        'Reward exchange not found or already processed',
      );
    const rewardMap = rewardMapResult[0];

    const userResult = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, userId, stars FROM User WHERE userId = ? AND branch = ? LIMIT 1`,
      rewardMap.userId,
      branch,
    );
    if (!userResult.length) throw new NotFoundException('User not found');
    const user = userResult[0];

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `UPDATE UserRewardMap SET status = ?, note = ?, updatedAt = ? WHERE id = ?`,
        action,
        note || null,
        getCurrentTimeVNDB(),
        id,
      );

      if (action === 'APPROVE') {
        await tx.$executeRawUnsafe(
          `UPDATE UserRewardMap SET isUsed = true WHERE id = ?`,
          id,
        );

        if (rewardMap.type === 'EVENT') {
          if (rewardMap.pcId) {
            await tx.$executeRawUnsafe(
              `UPDATE PromotionCode SET isUsed = true, updatedAt = NOW() WHERE id = ?`,
              rewardMap.pcId,
            );
          }

          if (
            ['FREE_HOURS', 'MAIN_ACCOUNT_TOPUP'].includes(
              rewardMap.eventRewardType,
            )
          ) {
            const walletType =
              rewardMap.eventRewardType === 'MAIN_ACCOUNT_TOPUP'
                ? 'MAIN'
                : 'SUB';
            await updateFnetMoney({
              userId: rewardMap.userId,
              branch: branch,
              walletType: walletType,
              amount: Number(rewardMap.eventRewardValue),
              targetId: id,
              transactionType: 'REWARD',
              saveHistory: false,
            });
          }
        } else if (rewardMap.type === 'STARS') {
          const oldStars = (user.stars || 0) + (rewardMap.rewardStars || 0);
          await tx.$executeRawUnsafe(
            `INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
             VALUES (?, 'REWARD', ?, ?, ?, ?, ?)`,
            user.userId,
            oldStars,
            user.stars,
            id,
            getCurrentTimeVNDB(),
            branch,
          );

          if (rewardMap.rewardValue) {
            await updateFnetMoney({
              userId: rewardMap.userId,
              branch: branch,
              walletType: 'SUB',
              amount: Number(rewardMap.rewardValue),
              targetId: id,
              transactionType: 'REWARD',
              saveHistory: false,
            });
          }
        }
      } else if (action === 'REJECT') {
        if (rewardMap.type === 'EVENT' && rewardMap.pcId) {
          await tx.$executeRawUnsafe(
            `UPDATE PromotionCode SET isUsed = false WHERE id = ?`,
            rewardMap.pcId,
          );
        } else if (rewardMap.type === 'STARS' && rewardMap.rewardStars) {
          await tx.$executeRawUnsafe(
            `UPDATE User SET stars = stars + ?, updatedAt = ? WHERE id = ?`,
            rewardMap.rewardStars,
            getCurrentTimeVNDB(),
            user.id,
          );
        }
      }
      return { success: true };
    });
  }
}
