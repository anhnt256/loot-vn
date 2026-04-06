import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { MasterPrismaService, TenantPrismaService, FnetPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { ConfigService } from '../config/config.service';
import {
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
} from '../computer/computer.utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const JACKPOT_ID = 8;
const UP_RATE = 0.5;

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

/** In-memory rate limit store for game rolls */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkGameRollRateLimit(userId: number, tenantId: string): { allowed: boolean; resetTime: number } {
  const key = `game_roll:${tenantId}:${userId}`;
  const now = Date.now();
  for (const [k, v] of rateLimitStore.entries()) {
    if (now > v.resetTime) rateLimitStore.delete(k);
  }
  const current = rateLimitStore.get(key);
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 10000 });
    return { allowed: true, resetTime: now + 10000 };
  }
  if (current.count >= 1) {
    return { allowed: false, resetTime: current.resetTime };
  }
  current.count++;
  return { allowed: true, resetTime: current.resetTime };
}

function getCurrentTimeVNDB(): string {
  return dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
}

function randomItem(itemRates: any[]): any {
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

@Injectable()
export class GameService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly fnetPrisma: FnetPrismaService,
    private readonly configService: ConfigService,
  ) {}

  private async getClients(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');
    const gateway = await this.tenantPrisma.getClient(dbUrl);

    const fnetUrl = (tenant as any).fnetUrl;
    if (!fnetUrl) throw new BadRequestException('Tenant chưa cấu hình fnetUrl');
    const fnet = await this.fnetPrisma.getClient(fnetUrl);

    return { gateway: gateway as any, fnet, tenant };
  }

  /** Ensure Item table has showOnWheel + displayOrder columns */
  private async ensureItemSchema(gateway: any) {
    try {
      const cols = await gateway.$queryRawUnsafe(`SHOW COLUMNS FROM Item LIKE 'showOnWheel'`) as any[];
      if (cols.length === 0) {
        await gateway.$executeRawUnsafe(`ALTER TABLE Item ADD COLUMN showOnWheel TINYINT(1) NOT NULL DEFAULT 1`);
        await gateway.$executeRawUnsafe(`ALTER TABLE Item ADD COLUMN displayOrder INT NOT NULL DEFAULT 0`);
        // Seed: set displayOrder = id - 1, hide Jackpot (id=8)
        await gateway.$executeRawUnsafe(`UPDATE Item SET displayOrder = id - 1`);
        await gateway.$executeRawUnsafe(`UPDATE Item SET showOnWheel = 0 WHERE id = 8`);
      }
    } catch {
      // columns may already exist, ignore
    }
  }

  private async getGatewayClient(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');
    return await this.tenantPrisma.getClient(dbUrl);
  }

  // ─── GET /game/fund ───
  async getFund(tenantId: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId) as any;
      const configs = await this.configService.getConfigs(tenantId);
      const ROUND_COST = Number(configs['SPEND_PER_ROUND']) || 30000;
      const rateConfig = Number(configs['GAME_FUND_RATE']) || 1.5;
      const RATE = rateConfig / 100;

      const lastJackPotDate = await gatewayClient.$queryRaw`
        SELECT createdAt FROM GameResult
        WHERE itemId = 8
        ORDER BY createdAt DESC
        LIMIT 1
      ` as any[];

      let totalRound;
      if (lastJackPotDate.length > 0) {
        const totalRoundResult = await gatewayClient.$queryRaw`
          SELECT COUNT(*) as count FROM GameResult gr
          INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
          WHERE gr.createdAt > ${lastJackPotDate[0].createdAt}
        ` as any[];
        totalRound = Number(totalRoundResult[0].count);
      } else {
        const totalRoundResult = await gatewayClient.$queryRaw`
          SELECT COUNT(*) as count FROM GameResult gr
          INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
        ` as any[];
        totalRound = Number(totalRoundResult[0].count);
      }

      return totalRound * ROUND_COST * RATE;
    } catch (error) {
      console.error('Failed to fetch fund amount:', error);
      throw new InternalServerErrorException('Failed to fetch fund amount');
    }
  }

  // ─── GET /game/items (client - only visible on wheel, no rating) ───
  async getItems(tenantId: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId) as any;
      await this.ensureItemSchema(gatewayClient);
      const gameItems = await gatewayClient.$queryRaw`
        SELECT id, title, background, value, textColor
        FROM Item
        WHERE showOnWheel = 1
        ORDER BY displayOrder ASC
      `;
      return gameItems;
    } catch (error) {
      console.error('Failed to fetch game items:', error);
      throw new InternalServerErrorException('Failed to fetch game items');
    }
  }

  // ─── GET /game/admin-items (admin - all items with full info) ───
  async getItemsAdmin(tenantId: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId) as any;
      await this.ensureItemSchema(gatewayClient);
      const gameItems = await gatewayClient.$queryRaw`
        SELECT id, title, background, value, textColor, rating, showOnWheel, displayOrder
        FROM Item
        ORDER BY displayOrder ASC
      `;
      return gameItems;
    } catch (error) {
      console.error('Failed to fetch game items (admin):', error);
      throw new InternalServerErrorException('Failed to fetch game items');
    }
  }

  // ─── PUT /game/bulk-items ───
  async bulkUpdateItems(tenantId: string, items: { id: number; title: string; value: number; background: string; textColor: string; rating: number; showOnWheel: boolean; displayOrder: number }[]) {
    const totalRating = items.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    if (Math.abs(totalRating - 100) > 0.01) {
      throw new BadRequestException(`Tổng tỉ lệ phải đạt 100%. Hiện tại: ${totalRating.toFixed(1)}%`);
    }

    try {
      const gatewayClient = await this.getGatewayClient(tenantId) as any;
      await gatewayClient.$transaction(async (tx: any) => {
        for (const item of items) {
          await tx.$executeRawUnsafe(
            'UPDATE Item SET `title`=?, `value`=?, `background`=?, `textColor`=?, `rating`=?, `showOnWheel`=?, `displayOrder`=? WHERE id=?',
            item.title, item.value, item.background, item.textColor, item.rating, item.showOnWheel ? 1 : 0, item.displayOrder, item.id,
          );
        }
      });
      return { success: true };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      console.error('Failed to bulk update game items:', error);
      throw new InternalServerErrorException('Failed to bulk update game items');
    }
  }

  // ─── PUT /game/items/:id ───
  async updateItem(tenantId: string, id: number, data: { title?: string; value?: number; background?: string; textColor?: string; rating?: number }) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId) as any;

      // Validate total rating = 100% if rating is being changed
      if (data.rating !== undefined) {
        const allItems = await gatewayClient.$queryRaw`SELECT id, rating FROM Item` as any[];
        const totalRating = allItems.reduce((sum: number, item: any) => {
          const r = item.id === id ? data.rating! : Number(item.rating || 0);
          return sum + r;
        }, 0);
        // Allow small floating point tolerance
        if (Math.abs(totalRating - 100) > 0.01) {
          throw new BadRequestException(
            `Tổng tỉ lệ phải đạt 100%. Hiện tại: ${totalRating.toFixed(1)}%`,
          );
        }
      }

      const sets: string[] = [];
      const values: any[] = [];

      if (data.title !== undefined) { sets.push('title'); values.push(data.title); }
      if (data.value !== undefined) { sets.push('value'); values.push(data.value); }
      if (data.background !== undefined) { sets.push('background'); values.push(data.background); }
      if (data.textColor !== undefined) { sets.push('textColor'); values.push(data.textColor); }
      if (data.rating !== undefined) { sets.push('rating'); values.push(data.rating); }

      if (sets.length === 0) throw new BadRequestException('No fields to update');

      const setClause = sets.map(f => `\`${f}\` = ?`).join(', ');
      await gatewayClient.$executeRawUnsafe(
        `UPDATE Item SET ${setClause} WHERE id = ?`,
        ...values,
        id,
      );

      return { success: true };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      console.error('Failed to update game item:', error);
      throw new InternalServerErrorException('Failed to update game item');
    }
  }

  // ─── GET /game/result ─── (server-wide, last 7 days, limit 100)
  async getServerResults(tenantId: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId) as any;
      const results = await gatewayClient.$queryRaw`
        SELECT gr.id, gr.userId, gr.itemId, gr.createdAt, gr.updatedAt,
               i.title, i.value,
               CONCAT(SUBSTRING(u.userName, 1, LENGTH(u.userName)-3), '***') as maskedUsername,
               MAX(ush.oldStars) as oldStars,
               MAX(ush.newStars) as newStars
        FROM GameResult gr
               INNER JOIN Item i ON gr.itemId = i.id
               INNER JOIN User u ON gr.userId = u.userId
               LEFT JOIN UserStarHistory ush ON gr.userId = ush.userId
                 AND ush.targetId = gr.id
                 AND ush.type = 'GAME'
        WHERE gr.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY gr.id, gr.userId, gr.itemId, gr.createdAt, gr.updatedAt, i.title, i.value, u.userName
        ORDER BY gr.createdAt DESC, MAX(ush.newStars) DESC
        LIMIT 100
      `;
      return results;
    } catch (error) {
      console.error('[GAME_RESULT_GET]', error);
      throw new InternalServerErrorException('Failed to fetch game results');
    }
  }

  // ─── GET /game/:userId/result ─── (user-specific, last 7 days, limit 50)
  async getUserResults(tenantId: string, userId: number) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId) as any;
      const results = await gatewayClient.$queryRaw`
        SELECT gr.id, gr.userId, gr.itemId, gr.createdAt, gr.updatedAt,
               i.title, i.value,
               MAX(ush.oldStars) as oldStars,
               MAX(ush.newStars) as newStars
        FROM GameResult gr
               INNER JOIN Item i ON gr.itemId = i.id
               INNER JOIN User u ON gr.userId = u.userId
               LEFT JOIN UserStarHistory ush ON gr.userId = ush.userId
                 AND ush.targetId = gr.id
                 AND ush.type = 'GAME'
        WHERE gr.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND gr.userId = ${userId}
        GROUP BY gr.id, gr.userId, gr.itemId, gr.createdAt, gr.updatedAt, i.title, i.value
        ORDER BY gr.createdAt DESC, MAX(ush.newStars) DESC
        LIMIT 50
      `;
      return results;
    } catch (error) {
      console.error('[GAME_USER_RESULT_GET]', error);
      throw new InternalServerErrorException('Failed to fetch user game results');
    }
  }

  // ─── POST /game/result ─── (create game roll)
  async createGameResult(tenantId: string, userId: number, rolls: number, type: 'Wish' | 'Gift') {
    // Rate limit check
    const rl = checkGameRollRateLimit(userId, tenantId);
    if (!rl.allowed) {
      throw new BadRequestException(
        `Quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil((rl.resetTime - Date.now()) / 1000)} giây.`,
      );
    }

    const configs = await this.configService.getConfigs(tenantId);
    const spendPerRound = Number(configs['SPEND_PER_ROUND']) || 30000;
    const upRateAmount = Number(configs['UP_RATE_AMOUNT']) || 500000;
    const RATE = (Number(configs['GAME_FUND_RATE']) || 1.5) / 100;
    const nowDB = getCurrentTimeVNDB();

    if (type === 'Gift') {
      return this.processGiftRoll(tenantId, userId, rolls, upRateAmount, RATE, spendPerRound, nowDB);
    } else {
      return this.processWishRoll(tenantId, userId, rolls, upRateAmount, RATE, spendPerRound, nowDB);
    }
  }

  // ─── Gift Roll ───
  private async processGiftRoll(
    tenantId: string,
    userId: number,
    rolls: number,
    upRateAmount: number,
    RATE: number,
    spendPerRound: number,
    nowDB: string,
  ) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId) as any;

      return await gatewayClient.$transaction(async (tx: any) => {
        // Find available gift rounds (FIFO)
        const giftRounds = await tx.$queryRaw`
          SELECT * FROM GiftRound
          WHERE userId = ${userId} AND expiredAt >= NOW()
          ORDER BY createdAt ASC
        ` as any[];

        const availableGiftRounds = giftRounds.filter((gr: any) => gr.amount - gr.usedAmount > 0);

        if (availableGiftRounds.length === 0) {
          throw new BadRequestException('Bạn không còn lượt Tinh Cầu Thưởng.');
        }

        const totalAvailable = availableGiftRounds.reduce((sum: number, gr: any) => sum + (gr.amount - gr.usedAmount), 0);
        if (totalAvailable < rolls) {
          throw new BadRequestException(`Bạn chỉ còn ${totalAvailable} lượt Tinh Cầu Thưởng, không đủ ${rolls} lượt.`);
        }

        // Get user
        const users = await tx.$queryRaw`SELECT * FROM User WHERE userId = ${userId} LIMIT 1` as any[];
        const user = users[0];
        if (!user) throw new BadRequestException('User not found');

        // Get item rates and jackpot info
        let itemRates = await tx.$queryRaw`SELECT * FROM Item` as any[];
        const { totalFund } = await this.getJackpotInfo(tx, spendPerRound, RATE);

        let jackpotHit = false;
        let totalAddedStars = 0;
        const results: any[] = [];
        let remainingRolls = rolls;
        let currentGiftRoundIndex = 0;

        while (remainingRolls > 0 && currentGiftRoundIndex < availableGiftRounds.length) {
          const currentGiftRound = availableGiftRounds[currentGiftRoundIndex];
          const availableInCurrentRound = currentGiftRound.amount - currentGiftRound.usedAmount;
          const rollsToUse = Math.min(remainingRolls, availableInCurrentRound);

          for (let i = 0; i < rollsToUse; i++) {
            const selectedItem = randomItem(itemRates);
            let addedStar = selectedItem.value;
            if (selectedItem.id === JACKPOT_ID) {
              addedStar = totalFund;
              jackpotHit = true;
            }

            await tx.$executeRaw`
              INSERT INTO GameResult (userId, itemId, createdAt, updatedAt)
              VALUES (${userId}, ${selectedItem.id}, ${nowDB}, ${nowDB})
            `;

            const gameResultRes = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id` as any[];
            const gameResultId = gameResultRes[0].id;

            const currentStars = user.stars + totalAddedStars;
            await tx.$executeRaw`
              INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt)
              VALUES (${userId}, 'GIFT_ROUND', ${currentStars}, ${currentStars + addedStar}, ${gameResultId}, ${nowDB})
            `;

            totalAddedStars += addedStar;
            results.push({
              id: selectedItem.id,
              image_url: selectedItem.image_url,
              title: selectedItem.title,
              value: addedStar,
            });

            itemRates = await this.updateRates(tx, itemRates, jackpotHit, totalFund, upRateAmount);
          }

          // Update GiftRound
          const newUsedAmount = currentGiftRound.usedAmount + rollsToUse;
          const isUsed = newUsedAmount >= currentGiftRound.amount;
          await tx.$executeRaw`
            UPDATE GiftRound
            SET usedAmount = ${newUsedAmount}, isUsed = ${isUsed}, updatedAt = ${nowDB}
            WHERE id = ${currentGiftRound.id}
          `;

          remainingRolls -= rollsToUse;
          currentGiftRoundIndex++;
        }

        // Update user stars
        await tx.$executeRaw`
          UPDATE User SET stars = ${user.stars + totalAddedStars}, updatedAt = ${nowDB}
          WHERE userId = ${userId}
        `;

        return results;
      });
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      console.error('[GAME_GIFT_ROLL]', error);
      throw new InternalServerErrorException('Failed to create gift game result.');
    }
  }

  // ─── Wish Roll ───
  private async processWishRoll(
    tenantId: string,
    userId: number,
    rolls: number,
    upRateAmount: number,
    RATE: number,
    spendPerRound: number,
    nowDB: string,
  ) {
    try {
      const { gateway, fnet } = await this.getClients(tenantId);

      return await gateway.$transaction(async (tx: any) => {
        // Get user
        const users = await tx.$queryRaw`SELECT * FROM User WHERE userId = ${userId} LIMIT 1` as any[];
        const user = users[0];
        if (!user) throw new BadRequestException('User not found');

        // Calculate actual magic stone from topups
        const startOfWeekVN = getStartOfWeekVNISO();
        const endOfWeekVN = getEndOfWeekVNISO();

        const topupResult = await fnet.$queryRawUnsafe(`
          SELECT COALESCE(CAST(SUM(p.AutoAmount) AS DECIMAL(18,2)), 0) AS totalTopUp
          FROM fnet.paymenttb p
          WHERE p.UserId = ${userId}
            AND p.PaymentType = 4
            AND p.Note = N'Thời gian phí'
            AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) >= '${startOfWeekVN}'
            AND (p.ServeDate + INTERVAL p.ServeTime HOUR_SECOND) <= NOW()
        `) as any[];

        const topUpValue = topupResult[0]?.totalTopUp;
        const userTopUp = typeof topUpValue === 'bigint' ? Number(topUpValue) : Number(topUpValue || 0);
        const round = Math.floor(userTopUp / spendPerRound);

        const usedRoundsResult = await tx.$queryRaw`
          SELECT COUNT(*) as count FROM UserStarHistory
          WHERE userId = ${userId} AND type = 'GAME'
            AND createdAt >= ${startOfWeekVN} AND createdAt <= ${endOfWeekVN}
        ` as any[];
        const usedRounds = Number(usedRoundsResult[0]?.count || 0);
        const actualMagicStone = round - usedRounds;

        if (actualMagicStone < rolls) {
          throw new BadRequestException('Bạn không đủ đá năng lượng.');
        }

        // Get item rates and jackpot info
        let itemRates = await tx.$queryRaw`SELECT * FROM Item` as any[];
        const { totalFund } = await this.getJackpotInfo(tx, spendPerRound, RATE);

        let jackpotHit = false;
        let totalAddedStars = 0;
        const results: any[] = [];

        for (let i = 0; i < rolls; i++) {
          const selectedItem = randomItem(itemRates);
          let addedStar = selectedItem.value;
          if (selectedItem.id === JACKPOT_ID) {
            addedStar = totalFund;
            jackpotHit = true;
          }

          await tx.$executeRaw`
            INSERT INTO GameResult (userId, itemId, createdAt, updatedAt)
            VALUES (${userId}, ${selectedItem.id}, ${nowDB}, ${nowDB})
          `;

          const gameResultRes = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id` as any[];
          const gameResultId = gameResultRes[0].id;

          const currentStars = user.stars + totalAddedStars;
          await tx.$executeRaw`
            INSERT INTO UserStarHistory (userId, type, oldStars, newStars, targetId, createdAt)
            VALUES (${userId}, 'GAME', ${currentStars}, ${currentStars + addedStar}, ${gameResultId}, ${nowDB})
          `;

          totalAddedStars += addedStar;
          results.push({
            id: selectedItem.id,
            image_url: selectedItem.image_url,
            title: selectedItem.title,
            value: addedStar,
          });

          itemRates = await this.updateRates(tx, itemRates, jackpotHit, totalFund, upRateAmount);
        }

        // Update user
        const newMagicStone = actualMagicStone - rolls;
        await tx.$executeRaw`
          UPDATE User
          SET stars = ${user.stars + totalAddedStars}, magicStone = ${newMagicStone}, updatedAt = ${nowDB}
          WHERE userId = ${userId}
        `;

        return results;
      });
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      console.error('[GAME_WISH_ROLL]', error);
      throw new InternalServerErrorException('Failed to create game result.');
    }
  }

  // ─── Helpers ───
  private async getJackpotInfo(tx: any, roundCost: number, rate: number) {
    const lastJackPots = await tx.$queryRaw`
      SELECT createdAt FROM GameResult WHERE itemId = ${JACKPOT_ID}
      ORDER BY createdAt DESC LIMIT 1
    ` as any[];
    const lastJackPot = lastJackPots[0];

    let totalRounds;
    if (lastJackPot?.createdAt) {
      totalRounds = await tx.$queryRaw`
        SELECT COUNT(*) as count FROM GameResult gr
        INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
        WHERE gr.createdAt > ${lastJackPot.createdAt}
      ` as any[];
    } else {
      totalRounds = await tx.$queryRaw`
        SELECT COUNT(*) as count FROM GameResult gr
        INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
      ` as any[];
    }

    const totalRound = Number(totalRounds[0]?.count || 0);
    const totalFund = totalRound * roundCost * rate;
    return { lastJackPot, totalFund };
  }

  private async updateRates(
    tx: any,
    itemRates: any[],
    jackpotHit: boolean,
    totalFund: number,
    upRateAmount: number,
  ): Promise<any[]> {
    if (jackpotHit) {
      itemRates = itemRates.map((item: any) => {
        const def = ITEM_RATE_DEFAULT.find((d) => d.id === item.id);
        return def ? { ...item, rating: def.rating } : item;
      });
      for (const item of itemRates) {
        await tx.$executeRaw`UPDATE Item SET rating = ${item.rating} WHERE id = ${item.id}`;
      }
    } else if (totalFund >= upRateAmount) {
      const jackpotItem = itemRates.find((x: any) => x.id === JACKPOT_ID);
      if (jackpotItem) {
        jackpotItem.rating += UP_RATE;
        const others = itemRates.filter((x: any) => x.id !== JACKPOT_ID);
        const reduce = UP_RATE / others.length;
        others.forEach((x: any) => (x.rating -= reduce));
      }
      for (const item of itemRates) {
        await tx.$executeRaw`UPDATE Item SET rating = ${item.rating} WHERE id = ${item.id}`;
      }
    }
    return itemRates;
  }
}
