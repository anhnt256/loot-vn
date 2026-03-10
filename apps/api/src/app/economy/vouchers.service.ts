import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { getFnetDB } from '../lib/db';
import { getCurrentTimeVNDB, getCurrentTimeVNISO } from '../lib/timezone-utils';
import { updateFnetMoney } from '../lib/fnet-money-utils';
import {
  hasUserUsedEventReward,
  hasUserUsedNewUserWelcomeReward,
} from '../lib/event-reward-utils';

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async redeem(userId: number, branch: string, promotionCodeId: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Lock User record
        const userLock = await tx.$queryRaw<any[]>`
          SELECT id FROM User WHERE userId = ${userId} AND branch = ${branch} LIMIT 1 FOR UPDATE
        `;
        if (userLock.length === 0)
          throw new NotFoundException('User not found');

        // 2. Check for pending rewards
        const pendingRewards = await tx.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM UserRewardMap WHERE userId = ${userId} AND branch = ${branch} AND status = 'INITIAL'
        `;
        if (Number(pendingRewards[0]?.count) > 0) {
          throw new BadRequestException(
            'Bạn đang có yêu cầu đổi thưởng đang chờ duyệt.',
          );
        }

        // 3. Lock and validate PromotionCode
        const promotionCode = await tx.$queryRaw<any[]>`
          SELECT * FROM PromotionCode WHERE id = ${promotionCodeId} AND branch = ${branch} AND isUsed = false LIMIT 1 FOR UPDATE
        `;
        if (promotionCode.length === 0)
          throw new NotFoundException(
            'Promotion code not found or already used',
          );

        const promo = promotionCode[0];
        if (new Date(promo.expirationDate) < new Date())
          throw new BadRequestException('Promotion code has expired');

        // 4. Handle specific reward types
        if (promo.rewardType === 'MAIN_ACCOUNT_TOPUP') {
          return await this.handleMainAccountTopup(
            promo,
            userId,
            branch,
            promotionCodeId,
            tx,
          );
        }
        if (promo.rewardType === 'FREE_HOURS') {
          return await this.handleFreeHours(
            promo,
            userId,
            branch,
            promotionCodeId,
            tx,
          );
        }

        // 5. Normal Event Reward handling
        const eventRewards = await tx.eventReward.findMany({
          where: { eventId: promo.eventId },
        });
        let eventRewardId = null;
        const itemTypeMap: Record<string, string> = {
          FREE_HOURS: 'HOURS',
          FREE_DRINK: 'DRINK',
          FREE_SNACK: 'SNACK',
          FREE_FOOD: 'FOOD',
        };
        const targetType = itemTypeMap[promo.rewardType];

        if (targetType) {
          for (const r of eventRewards) {
            try {
              const config = JSON.parse(r.rewardConfig);
              if (config.itemType === targetType) {
                eventRewardId = r.id;
                break;
              }
            } catch (e) {}
          }
        }
        if (!eventRewardId && eventRewards.length > 0)
          eventRewardId = eventRewards[0].id;

        if (eventRewardId) {
          if (promo.rewardType === 'NEW_USER_WELCOME') {
            if (await hasUserUsedNewUserWelcomeReward(userId, branch))
              throw new BadRequestException(
                'Bạn đã nhận phần thưởng chào mừng rồi',
              );
          } else {
            if (await hasUserUsedEventReward(userId, eventRewardId, branch))
              throw new BadRequestException(
                'Bạn đã sử dụng phần thưởng này rồi',
              );
          }
        }

        // 6. Create UserRewardMap
        await tx.$executeRaw`
          INSERT INTO UserRewardMap (userId, rewardId, promotionCodeId, duration, branch, isUsed, status, type, createdAt, updatedAt)
          VALUES (${userId}, ${eventRewardId}, ${promotionCodeId}, ${promo.rewardValue || null}, ${branch}, false, 'INITIAL', 'EVENT', NOW(), NOW())
        `;

        await tx.$executeRaw`UPDATE PromotionCode SET isUsed = true, updatedAt = NOW() WHERE id = ${promotionCodeId}`;

        return { success: true, message: 'Voucher redeemed successfully' };
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      this.logger.error('Redeem error:', error);
      throw new InternalServerErrorException('Failed to redeem voucher');
    }
  }

  private async handleMainAccountTopup(
    promo: any,
    userId: number,
    branch: string,
    promotionCodeId: number,
    tx: any,
  ) {
    const fnetDB = await getFnetDB(branch);
    const wallet = await fnetDB.$queryRaw<
      any[]
    >`SELECT main, sub FROM wallettb WHERE userid = ${userId} LIMIT 1`;
    if (wallet.length === 0) throw new NotFoundException('Wallet not found');

    const oldMain = Number(wallet[0].main) || 0;
    const oldSub = Number(wallet[0].sub) || 0;
    const newMain = oldMain + promo.rewardValue;

    await tx.$executeRaw`
      INSERT INTO UserRewardMap (userId, promotionCodeId, duration, branch, isUsed, status, type, createdAt, updatedAt)
      VALUES (${userId}, ${promotionCodeId}, ${promo.rewardValue}, ${branch}, false, 'INITIAL', 'EVENT', NOW(), NOW())
    `;

    const userRewardMap = await tx.$queryRaw<
      any[]
    >`SELECT LAST_INSERT_ID() as id`;
    const userRewardMapId = Number(userRewardMap[0].id);

    await tx.$executeRaw`
      INSERT INTO FnetHistory (userId, branch, oldSubMoney, newSubMoney, oldMainMoney, newMainMoney, moneyType, targetId, type, createdAt, updatedAt)
      VALUES (${userId}, ${branch}, ${oldSub}, ${oldSub}, ${oldMain}, ${newMain}, 'MAIN', ${userRewardMapId}, 'VOUCHER', NOW(), NOW())
    `;

    await tx.$executeRaw`UPDATE PromotionCode SET isUsed = true, updatedAt = NOW() WHERE id = ${promotionCodeId}`;

    return {
      success: true,
      message: 'Main account topup successful',
      amount: promo.rewardValue,
    };
  }

  private async handleFreeHours(
    promo: any,
    userId: number,
    branch: string,
    promotionCodeId: number,
    tx: any,
  ) {
    const fnetDB = await getFnetDB(branch);
    const wallet = await fnetDB.$queryRaw<
      any[]
    >`SELECT main, sub FROM wallettb WHERE userid = ${userId} LIMIT 1`;
    if (wallet.length === 0) throw new NotFoundException('Wallet not found');

    const oldMain = Number(wallet[0].main) || 0;
    const oldSub = Number(wallet[0].sub) || 0;
    const newSub = oldSub + promo.rewardValue;

    await tx.$executeRaw`
      INSERT INTO UserRewardMap (userId, promotionCodeId, duration, branch, isUsed, status, type, createdAt, updatedAt)
      VALUES (${userId}, ${promotionCodeId}, ${promo.rewardValue}, ${branch}, false, 'INITIAL', 'EVENT', NOW(), NOW())
    `;

    const userRewardMap = await tx.$queryRaw<
      any[]
    >`SELECT LAST_INSERT_ID() as id`;
    const userRewardMapId = Number(userRewardMap[0].id);

    await tx.$executeRaw`
      INSERT INTO FnetHistory (userId, branch, oldSubMoney, newSubMoney, oldMainMoney, newMainMoney, moneyType, targetId, type, createdAt, updatedAt)
      VALUES (${userId}, ${branch}, ${oldSub}, ${newSub}, ${oldMain}, ${oldMain}, 'SUB', ${userRewardMapId}, 'REWARD', NOW(), NOW())
    `;

    await tx.$executeRaw`UPDATE PromotionCode SET isUsed = true, updatedAt = NOW() WHERE id = ${promotionCodeId}`;

    return {
      success: true,
      message: 'Free hours redeemed successful',
      amount: promo.rewardValue,
    };
  }
}
