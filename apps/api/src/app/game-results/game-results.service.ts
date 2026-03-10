import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  getCurrentTimeVNISO,
  getCurrentTimeVNDB,
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
} from '../lib/timezone-utils';
import { checkGameRollRateLimit } from '../lib/rate-limit';
import { getFnetDB } from '../lib/db';
import { CreateGameResultInput } from './game-results.dto';

const UP_RATE = 0.5;
const ROUND_COST = process.env.NEXT_PUBLIC_SPEND_PER_ROUND;
const RATE = 0.015;
const UP_RATE_AMOUNT = process.env.NEXT_PUBLIC_UP_RATE_AMOUNT;
const JACKPOT_ID = 8;

const ITEM_RATE_DEFAULT = [
  { id: 1, rating: 58.4 },
  { id: 2, rating: 24.4 },
  { id: 3, rating: 9.8 },
  { id: 4, rating: 4.0 },
  { id: 5, rating: 2.0 },
  { id: 6, rating: 1.0 },
  { id: 7, rating: 0.5 },
  { id: 8, rating: 0.1 },
];

@Injectable()
export class GameResultsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getItemRates(txOrDb: any): Promise<any[]> {
    return await txOrDb.$queryRaw`SELECT * FROM Item`;
  }

  private async getJackpotInfo(
    txOrDb: any,
  ): Promise<{ lastJackPot: any; totalFund: number }> {
    const lastJackPots = await txOrDb.$queryRaw`
      SELECT createdAt FROM GameResult 
      WHERE itemId = ${JACKPOT_ID}
      ORDER BY createdAt DESC
      LIMIT 1
    `;
    const lastJackPot = (lastJackPots as any[])[0];

    let totalRounds;
    if (lastJackPot?.createdAt) {
      totalRounds = await txOrDb.$queryRaw`
        SELECT COUNT(*) as count FROM GameResult gr
        INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
        WHERE gr.createdAt > ${lastJackPot.createdAt}
      `;
    } else {
      totalRounds = await txOrDb.$queryRaw`
        SELECT COUNT(*) as count FROM GameResult gr
        INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
      `;
    }

    const totalRound = Number((totalRounds as any[])[0]?.count || 0);
    const totalFund = totalRound * Number(ROUND_COST) * RATE;
    return { lastJackPot, totalFund };
  }

  private randomItem(itemRates: any[]): any {
    const random = Math.random() * 100;
    let cumulative = 0;
    for (const item of itemRates) {
      cumulative += item.rating;
      if (random < cumulative) {
        return { ...item };
      }
    }
    return { ...itemRates[itemRates.length - 1] };
  }

  private async updateRates(
    txOrDb: any,
    itemRates: any[],
    jackpotHit: boolean,
    totalFund: number,
  ): Promise<any[]> {
    if (jackpotHit) {
      itemRates = itemRates.map((item: any) => {
        const def = ITEM_RATE_DEFAULT.find((d) => d.id === item.id);
        return def ? { ...item, rating: def.rating } : item;
      });
      for (const item of itemRates) {
        await txOrDb.$executeRaw`
          UPDATE Item 
          SET rating = ${item.rating}
          WHERE id = ${item.id}
        `;
      }
    } else if (totalFund >= Number(UP_RATE_AMOUNT)) {
      const jackpotItem = itemRates.find((x: any) => x.id === JACKPOT_ID);
      if (jackpotItem) {
        jackpotItem.rating += UP_RATE;
        const others = itemRates.filter((x: any) => x.id !== JACKPOT_ID);
        const reduce = UP_RATE / others.length;
        others.forEach((x: any) => (x.rating -= reduce));
      }
      for (const item of itemRates) {
        await txOrDb.$executeRaw`
          UPDATE Item 
          SET rating = ${item.rating}
          WHERE id = ${item.id}
        `;
      }
    }
    return itemRates;
  }

  async create(
    data: CreateGameResultInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    const { userId, branch, rolls, type } = data;

    // Rate limiting
    const rateLimitResult = await checkGameRollRateLimit(
      String(userId),
      branch,
    );
    if (!rateLimitResult.allowed) {
      throw new BadRequestException(
        `Quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} giây.`,
      );
    }

    if (rolls !== 1 && rolls !== 10) {
      throw new BadRequestException('Chỉ cho phép quay 1 hoặc 10 lần.');
    }

    if (type === 'Gift') {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const giftRounds = await tx.$queryRaw`
                SELECT * FROM GiftRound 
                WHERE userId = ${userId} AND branch = ${branch} AND expiredAt >= NOW()
                ORDER BY createdAt ASC
              `;

          const availableGiftRounds = (giftRounds as any[]).filter((gr) => {
            const available = gr.amount - gr.usedAmount;
            return available > 0;
          });

          if (availableGiftRounds.length === 0) {
            throw new BadRequestException(
              'Bạn không còn lượt Tinh Cầu Thưởng.',
            );
          }

          const totalAvailable = availableGiftRounds.reduce(
            (sum, gr) => sum + (gr.amount - gr.usedAmount),
            0,
          );
          if (totalAvailable < rolls) {
            throw new BadRequestException(
              `Bạn chỉ còn ${totalAvailable} lượt Tinh Cầu Thưởng, không đủ ${rolls} lượt.`,
            );
          }

          const users = await tx.$queryRaw`
                SELECT * FROM User 
                WHERE userId = ${userId} AND branch = ${branch}
                LIMIT 1
              `;
          const user = (users as any[])[0];
          if (!user) throw new BadRequestException('User not found');

          let itemRates = await this.getItemRates(tx);
          const { totalFund } = await this.getJackpotInfo(tx);

          let jackpotHit = false;
          let totalAddedStars = 0;
          const results = [];
          let remainingRolls = rolls;
          let currentGiftRoundIndex = 0;

          while (
            remainingRolls > 0 &&
            currentGiftRoundIndex < availableGiftRounds.length
          ) {
            const currentGiftRound = availableGiftRounds[currentGiftRoundIndex];
            const availableInCurrentRound =
              currentGiftRound.amount - currentGiftRound.usedAmount;
            const rollsToUse = Math.min(
              remainingRolls,
              availableInCurrentRound,
            );

            for (let i = 0; i < rollsToUse; i++) {
              let selectedItem = this.randomItem(itemRates);
              let addedStar = selectedItem.value;
              if (selectedItem.id === JACKPOT_ID) {
                addedStar = totalFund;
                jackpotHit = true;
              }

              await tx.$executeRaw`
                    INSERT INTO GameResult (userId, itemId, createdAt, updatedAt)
                    VALUES (${userId}, ${selectedItem.id}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
                  `;

              const gameResultResults =
                await tx.$queryRaw`SELECT LAST_INSERT_ID() as id`;
              const gameResult = (gameResultResults as any[])[0];

              const currentStars = user.stars + totalAddedStars;
              await tx.$executeRaw`
                    INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
                    VALUES (${userId}, 'GIFT_ROUND', ${currentStars}, ${currentStars + addedStar}, ${gameResult.id}, ${getCurrentTimeVNDB()}, ${branch})
                  `;

              totalAddedStars += addedStar;
              results.push({
                id: selectedItem.id,
                image_url: selectedItem.image_url,
                title: selectedItem.title,
                value: addedStar,
              });
              itemRates = await this.updateRates(
                tx,
                itemRates,
                jackpotHit,
                totalFund,
              );
            }

            const newUsedAmount = currentGiftRound.usedAmount + rollsToUse;
            const isUsed = newUsedAmount >= currentGiftRound.amount;
            await tx.$executeRaw`
                  UPDATE GiftRound 
                  SET usedAmount = ${newUsedAmount}, 
                      isUsed = ${isUsed}, 
                      updatedAt = ${getCurrentTimeVNDB()}
                  WHERE id = ${currentGiftRound.id}
                `;

            remainingRolls -= rollsToUse;
            currentGiftRoundIndex++;
          }

          await tx.$executeRaw`
                UPDATE User 
                SET stars = ${user.stars + totalAddedStars}, updatedAt = ${getCurrentTimeVNDB()}
                WHERE userId = ${userId} AND branch = ${branch}
              `;

          return { success: true, data: results };
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message || 'Failed to create gift game result.',
        );
      }
    } else {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const users = await tx.$queryRaw`
                SELECT * FROM User 
                WHERE userId = ${userId} AND branch = ${branch}
                LIMIT 1
              `;
          const user = (users as any[])[0];
          if (!user) throw new BadRequestException('User not found');

          const fnetDB = await getFnetDB(branch);
          const startOfWeekVN = getStartOfWeekVNISO();
          const endOfWeekVN = getEndOfWeekVNISO();

          const topupResult = await fnetDB.$queryRawUnsafe<any[]>(`
                SELECT COALESCE(CAST(SUM(p.AutoAmount) AS DECIMAL(18,2)), 0) AS totalTopUp
                FROM fnet.paymenttb p
                WHERE p.UserId = ${userId}
                  AND p.PaymentType = 4
                  AND p.Note = N'Thời gian phí'
                  AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) >= '${startOfWeekVN}'
                  AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) <= NOW()
              `);

          const topUpValue = topupResult[0]?.totalTopUp;
          const userTopUp =
            typeof topUpValue === 'bigint'
              ? Number(topUpValue)
              : Number(topUpValue || 0);
          const spendPerRound = Number(
            process.env.NEXT_PUBLIC_SPEND_PER_ROUND || 30000,
          );
          const round = Math.floor(userTopUp / spendPerRound);

          const usedRoundsResult = await tx.$queryRaw<any[]>`
                SELECT COUNT(*) as count
                FROM UserStarHistory
                WHERE userId = ${userId} AND branch = ${branch}
                  AND type = 'GAME'
                  AND createdAt >= ${startOfWeekVN}
                  AND createdAt <= ${endOfWeekVN}
              `;
          const usedRounds = Number(usedRoundsResult[0]?.count || 0);
          const actualMagicStone = round - usedRounds;

          if (actualMagicStone < rolls) {
            throw new BadRequestException('Bạn không đủ đá năng lượng.');
          }

          let itemRates = await this.getItemRates(tx);
          const { totalFund } = await this.getJackpotInfo(tx);

          let jackpotHit = false;
          let totalAddedStars = 0;
          const results = [];
          for (let i = 0; i < rolls; i++) {
            let selectedItem = this.randomItem(itemRates);
            let addedStar = selectedItem.value;
            if (selectedItem.id === JACKPOT_ID) {
              addedStar = totalFund;
              jackpotHit = true;
            }

            await tx.$executeRaw`
                  INSERT INTO GameResult (userId, itemId, createdAt, updatedAt)
                  VALUES (${userId}, ${selectedItem.id}, ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
                `;

            const gameResultResults =
              await tx.$queryRaw`SELECT LAST_INSERT_ID() as id`;
            const gameResult = (gameResultResults as any[])[0];

            const currentStars = user.stars + totalAddedStars;
            await tx.$executeRaw`
                  INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt, branch)
                  VALUES (${userId}, 'GAME', ${currentStars}, ${currentStars + addedStar}, ${gameResult.id}, ${getCurrentTimeVNDB()}, ${branch})
                `;

            totalAddedStars += addedStar;
            results.push({
              id: selectedItem.id,
              image_url: selectedItem.image_url,
              title: selectedItem.title,
              value: addedStar,
            });
            itemRates = await this.updateRates(
              tx,
              itemRates,
              jackpotHit,
              totalFund,
            );
          }

          const newMagicStone = actualMagicStone - rolls;
          await tx.$executeRaw`
                UPDATE User 
                SET stars = ${user.stars + totalAddedStars}, 
                    magicStone = ${newMagicStone}, 
                    updatedAt = ${getCurrentTimeVNDB()}
                WHERE userId = ${userId} AND branch = ${branch}
              `;

          return { success: true, data: results };
        });
      } catch (error: any) {
        throw new BadRequestException(error.message || 'Failed to create.');
      }
    }
  }
}
