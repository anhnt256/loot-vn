import { Injectable, BadRequestException } from '@nestjs/common';
import { MasterPrismaService, TenantPrismaService, FnetPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { db, getFnetDB } from '../../lib/db';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function getCurrentTimeVNDB(): string {
  return dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
}

@Injectable()
export class PromotionRewardService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly fnetPrisma: FnetPrismaService,
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

    return { gateway: gateway as any, fnet: fnetUrl, tenant };
  }

  /** Ensure tables exist (runs once per process, CREATE IF NOT EXISTS only) */
  private _schemaReady = false;
  private async ensureSchema(gateway: any) {
    if (this._schemaReady) return;

    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS PromotionReward (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        type ENUM('PLAY_TIME','FOOD','DRINK','VOUCHER','OTHER') NOT NULL,
        starsCost INT NOT NULL,
        walletType VARCHAR(10),
        moneyAmount INT,
        imageUrl VARCHAR(500),
        isActive BOOLEAN DEFAULT true,
        displayOrder INT DEFAULT 0,
        maxPerDay INT,
        maxPerMonth INT,
        totalQuantity INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    // Add totalQuantity column if table already existed
    try {
      await gateway.$executeRawUnsafe(`ALTER TABLE PromotionReward ADD COLUMN totalQuantity INT`);
    } catch {
      // Column already exists — ignore
    }
    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS PromotionRewardRecipe (
        id INT AUTO_INCREMENT PRIMARY KEY,
        promotionRewardId INT NOT NULL,
        recipeId INT NOT NULL,
        quantity INT DEFAULT 1,
        UNIQUE KEY uq_reward_recipe (promotionRewardId, recipeId),
        INDEX idx_reward (promotionRewardId),
        INDEX idx_recipe (recipeId)
      )
    `);
    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS PromotionRewardCategory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        promotionRewardId INT NOT NULL,
        categoryId INT NOT NULL,
        UNIQUE KEY uq_reward_category (promotionRewardId, categoryId),
        INDEX idx_reward (promotionRewardId),
        INDEX idx_category (categoryId)
      )
    `);
    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS PromotionRewardRedemption (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        promotionRewardId INT NOT NULL,
        starsCost INT NOT NULL,
        status ENUM('PENDING','APPROVED','COMPLETED','REJECTED') DEFAULT 'PENDING',
        rewardType ENUM('PLAY_TIME','FOOD','DRINK','VOUCHER','OTHER') NOT NULL,
        chosenRecipeId INT,
        chosenQuantity INT DEFAULT 1,
        walletType VARCHAR(10),
        moneyAmount INT,
        actualCost DECIMAL(12,2),
        workShiftId INT,
        approvedBy INT,
        note VARCHAR(500),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_userId (userId),
        INDEX idx_status (status),
        INDEX idx_rewardType (rewardType),
        INDEX idx_createdAt (createdAt),
        INDEX idx_workShiftId (workShiftId),
        INDEX idx_promotionRewardId (promotionRewardId)
      )
    `);
    // Ensure UserStarHistory.type enum includes REDEMPTION
    try {
      await gateway.$executeRawUnsafe(`
        ALTER TABLE UserStarHistory MODIFY COLUMN type ENUM('CHECK_IN','MISSION','REWARD','GAME','RETURN_GIFT','GIFT_ROUND','FEEDBACK','BATTLE_PASS','REDEMPTION')
      `);
    } catch {
      // Already has the enum value or column doesn't exist — ignore
    }

    this._schemaReady = true;
  }

  // ─── CRUD ───

  async getAll(tenantId: string) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);
    const rewards: any[] = await gateway.$queryRawUnsafe(`
      SELECT * FROM PromotionReward ORDER BY displayOrder ASC, id ASC
    `);
    // Attach recipes + categories for FOOD/DRINK types
    for (const r of rewards) {
      r.isActive = !!r.isActive;
      if (['FOOD', 'DRINK'].includes(r.type)) {
        r.recipes = await gateway.$queryRawUnsafe(`
          SELECT prr.*, rec.name as recipeName, rec.salePrice, rec.imageUrl as recipeImageUrl
          FROM PromotionRewardRecipe prr
          LEFT JOIN Recipe rec ON rec.id = prr.recipeId
          WHERE prr.promotionRewardId = ?
        `, r.id);
        r.categories = await gateway.$queryRawUnsafe(`
          SELECT prc.*, mc.name as categoryName
          FROM PromotionRewardCategory prc
          LEFT JOIN MenuCategory mc ON mc.id = prc.categoryId
          WHERE prc.promotionRewardId = ?
        `, r.id);
      } else {
        r.recipes = [];
        r.categories = [];
      }
    }
    return rewards;
  }

  async create(tenantId: string, data: any) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);

    const { name, description, type, starsCost, walletType, moneyAmount, imageUrl, isActive, displayOrder, maxPerDay, maxPerMonth, totalQuantity, recipes, categories } = data;

    await gateway.$executeRawUnsafe(`
      INSERT INTO PromotionReward (name, description, type, starsCost, walletType, moneyAmount, imageUrl, isActive, displayOrder, maxPerDay, maxPerMonth, totalQuantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, name, description || null, type, starsCost, walletType || null, moneyAmount || null, imageUrl || null, isActive !== false, displayOrder || 0, maxPerDay || null, maxPerMonth || null, totalQuantity || null);

    const lastIdRows: any[] = await gateway.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as lastId`);
    const rewardId = Number(lastIdRows[0]?.lastId);

    if (['FOOD', 'DRINK'].includes(type)) {
      // Insert recipes mapping
      if (recipes?.length) {
        for (const r of recipes) {
          await gateway.$executeRawUnsafe(`
            INSERT INTO PromotionRewardRecipe (promotionRewardId, recipeId, quantity)
            VALUES (?, ?, ?)
          `, rewardId, r.recipeId, r.quantity || 1);
        }
      }
      // Insert categories mapping
      if (categories?.length) {
        for (const c of categories) {
          await gateway.$executeRawUnsafe(`
            INSERT INTO PromotionRewardCategory (promotionRewardId, categoryId)
            VALUES (?, ?)
          `, rewardId, c.categoryId || c);
        }
      }
    }

    return { success: true, id: rewardId };
  }

  async update(tenantId: string, id: number, data: any) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);

    const { name, description, type, starsCost, walletType, moneyAmount, imageUrl, isActive, displayOrder, maxPerDay, maxPerMonth, totalQuantity, recipes, categories } = data;

    await gateway.$executeRawUnsafe(`
      UPDATE PromotionReward SET
        name = ?, description = ?, type = ?, starsCost = ?,
        walletType = ?, moneyAmount = ?, imageUrl = ?,
        isActive = ?, displayOrder = ?, maxPerDay = ?, maxPerMonth = ?, totalQuantity = ?
      WHERE id = ?
    `, name, description || null, type, starsCost, walletType || null, moneyAmount || null, imageUrl || null, isActive !== false, displayOrder || 0, maxPerDay || null, maxPerMonth || null, totalQuantity || null, id);

    // Replace recipes + categories
    await gateway.$executeRawUnsafe(`DELETE FROM PromotionRewardRecipe WHERE promotionRewardId = ?`, id);
    await gateway.$executeRawUnsafe(`DELETE FROM PromotionRewardCategory WHERE promotionRewardId = ?`, id);
    if (['FOOD', 'DRINK'].includes(type)) {
      if (recipes?.length) {
        for (const r of recipes) {
          await gateway.$executeRawUnsafe(`
            INSERT INTO PromotionRewardRecipe (promotionRewardId, recipeId, quantity)
            VALUES (?, ?, ?)
          `, id, r.recipeId, r.quantity || 1);
        }
      }
      if (categories?.length) {
        for (const c of categories) {
          await gateway.$executeRawUnsafe(`
            INSERT INTO PromotionRewardCategory (promotionRewardId, categoryId)
            VALUES (?, ?)
          `, id, c.categoryId || c);
        }
      }
    }

    return { success: true };
  }

  /**
   * Get categories + recipes filtered by reward type.
   * FOOD → categories with BAO_CAO_BEP materials
   * DRINK → categories with BAO_CAO_NUOC materials
   */
  async getMenuOptions(tenantId: string, rewardType: string) {
    const { gateway } = await this.getClients(tenantId);

    // Map reward type to material reportType
    const reportType = rewardType === 'FOOD' ? 'BAO_CAO_BEP' : 'BAO_CAO_NUOC';

    // Get categories that have recipes using materials with the matching reportType
    const categories: any[] = await gateway.$queryRawUnsafe(`
      SELECT DISTINCT mc.id, mc.name, mc.sortOrder,
        (SELECT COUNT(*) FROM Recipe r WHERE r.categoryId = mc.id AND r.isActive = true) as recipeCount
      FROM MenuCategory mc
      WHERE mc.isActive = true
        AND mc.id IN (
          SELECT DISTINCT r.categoryId
          FROM Recipe r
          JOIN RecipeVersion rv ON rv.recipeId = r.id AND rv.isActive = true
          JOIN RecipeItem ri ON ri.recipeVersionId = rv.id
          JOIN Material m ON m.id = ri.materialId AND m.reportType = ?
          WHERE r.isActive = true AND r.categoryId IS NOT NULL
        )
      ORDER BY mc.sortOrder ASC
    `, reportType);

    // Get recipes in those categories
    const categoryIds = categories.map((c: any) => c.id);
    let recipes: any[] = [];
    if (categoryIds.length > 0) {
      recipes = await gateway.$queryRawUnsafe(`
        SELECT DISTINCT r.id, r.name, r.salePrice, r.imageUrl, r.categoryId
        FROM Recipe r
        JOIN RecipeVersion rv ON rv.recipeId = r.id AND rv.isActive = true
        JOIN RecipeItem ri ON ri.recipeVersionId = rv.id
        JOIN Material m ON m.id = ri.materialId AND m.reportType = ?
        WHERE r.isActive = true AND r.categoryId IN (${categoryIds.join(',')})
        ORDER BY r.name ASC
      `, reportType);
    }

    return {
      categories: categories.map((c: any) => ({ ...c, id: Number(c.id), recipeCount: Number(c.recipeCount) })),
      recipes: recipes.map((r: any) => ({ ...r, id: Number(r.id), salePrice: Number(r.salePrice), categoryId: Number(r.categoryId) })),
    };
  }

  async toggleActive(tenantId: string, id: number) {
    const { gateway } = await this.getClients(tenantId);
    await gateway.$executeRawUnsafe(`UPDATE PromotionReward SET isActive = NOT isActive WHERE id = ?`, id);
    return { success: true };
  }

  async reorder(tenantId: string, items: { id: number; displayOrder: number }[]) {
    const { gateway } = await this.getClients(tenantId);
    for (const item of items) {
      await gateway.$executeRawUnsafe(`UPDATE PromotionReward SET displayOrder = ? WHERE id = ?`, item.displayOrder, item.id);
    }
    return { success: true };
  }

  // ─── Client: Available rewards ───

  async getAvailable(tenantId: string) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);
    const rewards: any[] = await gateway.$queryRawUnsafe(`
      SELECT id, name, description, type, starsCost, walletType, moneyAmount, imageUrl, maxPerDay, maxPerMonth, totalQuantity
      FROM PromotionReward
      WHERE isActive = true
      ORDER BY displayOrder ASC
    `);
    for (const r of rewards) {
      if (['FOOD', 'DRINK'].includes(r.type)) {
        // Direct recipe mappings
        const directRecipes: any[] = await gateway.$queryRawUnsafe(`
          SELECT prr.recipeId, prr.quantity, rec.name as recipeName, rec.salePrice, rec.imageUrl as recipeImageUrl
          FROM PromotionRewardRecipe prr
          LEFT JOIN Recipe rec ON rec.id = prr.recipeId
          WHERE prr.promotionRewardId = ?
        `, r.id);
        // Recipes from mapped categories
        const categoryRecipes: any[] = await gateway.$queryRawUnsafe(`
          SELECT rec.id as recipeId, 1 as quantity, rec.name as recipeName, rec.salePrice, rec.imageUrl as recipeImageUrl
          FROM PromotionRewardCategory prc
          JOIN Recipe rec ON rec.categoryId = prc.categoryId AND rec.isActive = true
          WHERE prc.promotionRewardId = ?
        `, r.id);
        // Merge, deduplicate by recipeId
        const seen = new Set<number>();
        r.recipes = [];
        for (const item of [...directRecipes, ...categoryRecipes]) {
          if (!seen.has(item.recipeId)) {
            seen.add(item.recipeId);
            r.recipes.push(item);
          }
        }
        // Calculate stock availability for each recipe
        for (const recipe of r.recipes) {
          const qty = recipe.quantity || 1;
          const stockRows: any[] = await gateway.$queryRawUnsafe(`
            SELECT FLOOR(MIN(m.quantityInStock / (ri.quantity * ?))) as maxServings
            FROM RecipeItem ri
            JOIN Material m ON m.id = ri.materialId
            JOIN RecipeVersion rv ON rv.id = ri.recipeVersionId
            WHERE rv.recipeId = ? AND rv.isActive = true AND ri.quantity > 0
          `, qty, recipe.recipeId);
          recipe.availableStock = stockRows[0]?.maxServings != null ? Number(stockRows[0].maxServings) : 0;
        }
      }
      // Calculate remaining redemption quantity
      if (r.totalQuantity) {
        const [{ cnt }]: any[] = await gateway.$queryRawUnsafe(`
          SELECT COUNT(*) as cnt FROM PromotionRewardRedemption
          WHERE promotionRewardId = ? AND status != 'REJECTED'
        `, r.id);
        r.remainingQuantity = Number(r.totalQuantity) - Number(cnt);
      } else {
        r.remainingQuantity = null;
      }
    }
    return rewards;
  }

  // ─── Redeem ───

  async redeem(tenantId: string, userId: number, rewardId: number, chosenRecipeId?: number) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);

    // Get reward
    const rewards: any[] = await gateway.$queryRawUnsafe(`SELECT * FROM PromotionReward WHERE id = ? AND isActive = true`, rewardId);
    if (!rewards.length) throw new BadRequestException('Phần thưởng không tồn tại hoặc đã tắt');
    const reward = rewards[0];

    // Check user stars
    const users: any[] = await gateway.$queryRawUnsafe(`SELECT userId, stars FROM User WHERE userId = ?`, userId);
    if (!users.length) throw new BadRequestException('User không tồn tại');
    const user = users[0];
    if (user.stars < reward.starsCost) throw new BadRequestException(`Không đủ sao. Cần ${reward.starsCost}, hiện có ${user.stars}`);

    // Check total quantity limit
    if (reward.totalQuantity) {
      const [{ cnt }]: any[] = await gateway.$queryRawUnsafe(`
        SELECT COUNT(*) as cnt FROM PromotionRewardRedemption
        WHERE promotionRewardId = ? AND status != 'REJECTED'
      `, rewardId);
      if (Number(cnt) >= reward.totalQuantity) throw new BadRequestException(`Phần thưởng đã hết (giới hạn ${reward.totalQuantity} lượt)`);
    }

    // Check daily/monthly limits
    if (reward.maxPerDay) {
      const [{ cnt }]: any[] = await gateway.$queryRawUnsafe(`
        SELECT COUNT(*) as cnt FROM PromotionRewardRedemption
        WHERE userId = ? AND promotionRewardId = ? AND status != 'REJECTED'
        AND DATE(createdAt) = CURDATE()
      `, userId, rewardId);
      if (Number(cnt) >= reward.maxPerDay) throw new BadRequestException(`Đã đạt giới hạn đổi trong ngày (${reward.maxPerDay} lần)`);
    }
    if (reward.maxPerMonth) {
      const [{ cnt }]: any[] = await gateway.$queryRawUnsafe(`
        SELECT COUNT(*) as cnt FROM PromotionRewardRedemption
        WHERE userId = ? AND promotionRewardId = ? AND status != 'REJECTED'
        AND YEAR(createdAt) = YEAR(CURDATE()) AND MONTH(createdAt) = MONTH(CURDATE())
      `, userId, rewardId);
      if (Number(cnt) >= reward.maxPerMonth) throw new BadRequestException(`Đã đạt giới hạn đổi trong tháng (${reward.maxPerMonth} lần)`);
    }

    // Validate chosen recipe for FOOD/DRINK (direct recipes + category recipes)
    let chosenQuantity = 1;
    if (['FOOD', 'DRINK'].includes(reward.type)) {
      const directRecipes: any[] = await gateway.$queryRawUnsafe(
        `SELECT recipeId, quantity FROM PromotionRewardRecipe WHERE promotionRewardId = ?`, rewardId
      );
      const categoryRecipes: any[] = await gateway.$queryRawUnsafe(`
        SELECT rec.id as recipeId, 1 as quantity
        FROM PromotionRewardCategory prc
        JOIN Recipe rec ON rec.categoryId = prc.categoryId AND rec.isActive = true
        WHERE prc.promotionRewardId = ?
      `, rewardId);
      // Merge
      const allRecipes = new Map<number, number>();
      for (const r of directRecipes) allRecipes.set(r.recipeId, r.quantity || 1);
      for (const r of categoryRecipes) { if (!allRecipes.has(r.recipeId)) allRecipes.set(r.recipeId, 1); }

      if (allRecipes.size === 1) {
        const [first] = allRecipes.entries();
        chosenRecipeId = first[0];
        chosenQuantity = first[1];
      } else if (allRecipes.size > 1) {
        if (!chosenRecipeId) throw new BadRequestException('Vui lòng chọn món');
        if (!allRecipes.has(chosenRecipeId)) throw new BadRequestException('Món không thuộc phần thưởng này');
        chosenQuantity = allRecipes.get(chosenRecipeId) || 1;
      } else {
        throw new BadRequestException('Phần thưởng chưa cấu hình món nào');
      }
    }

    // Check material stock before allowing redemption for FOOD/DRINK
    if (['FOOD', 'DRINK'].includes(reward.type) && chosenRecipeId) {
      const stockCheck: any[] = await gateway.$queryRawUnsafe(`
        SELECT m.name as materialName, m.baseUnit,
          m.quantityInStock as stock,
          (ri.quantity * ?) as needed
        FROM RecipeItem ri
        JOIN Material m ON m.id = ri.materialId
        JOIN RecipeVersion rv ON rv.id = ri.recipeVersionId
        WHERE rv.recipeId = ? AND rv.isActive = true
          AND m.quantityInStock < (ri.quantity * ?)
      `, chosenQuantity, chosenRecipeId, chosenQuantity);

      if (stockCheck.length > 0) {
        const outOfStock = stockCheck.map((s: any) =>
          `${s.materialName} (còn ${Number(s.stock)} ${s.baseUnit}, cần ${Number(s.needed)} ${s.baseUnit})`
        ).join(', ');
        throw new BadRequestException(`Hết hàng — không đủ nguyên liệu: ${outOfStock}`);
      }
    }

    // Deduct stars
    const oldStars = user.stars;
    const newStars = oldStars - reward.starsCost;
    await gateway.$executeRawUnsafe(`UPDATE User SET stars = ? WHERE userId = ?`, newStars, userId);

    // Create redemption
    await gateway.$executeRawUnsafe(`
      INSERT INTO PromotionRewardRedemption
        (userId, promotionRewardId, starsCost, status, rewardType, chosenRecipeId, chosenQuantity, walletType, moneyAmount)
      VALUES (?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)
    `, userId, rewardId, reward.starsCost, reward.type,
       chosenRecipeId || null, chosenQuantity,
       reward.walletType || null, reward.moneyAmount || null);

    const lastIdRows2: any[] = await gateway.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as lastId`);
    const redemptionId = Number(lastIdRows2[0]?.lastId);

    // Record star history
    await gateway.$executeRawUnsafe(`
      INSERT INTO UserStarHistory (userId, oldStars, newStars, type, targetId, createdAt)
      VALUES (?, ?, ?, 'REDEMPTION', ?, ?)
    `, userId, oldStars, newStars, redemptionId, getCurrentTimeVNDB());

    return { success: true, id: redemptionId, newStars };
  }

  // ─── Admin: Manage redemptions ───

  async getPendingRedemptionCount(tenantId: string) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);
    const rows: any[] = await gateway.$queryRawUnsafe(
      `SELECT COUNT(*) as cnt FROM PromotionRewardRedemption WHERE status = 'PENDING'`,
    );
    return { count: Number(rows[0]?.cnt ?? 0) };
  }

  async getRedemptions(tenantId: string, status?: string, from?: string, to?: string) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);

    let where = 'WHERE 1=1';
    if (status) where += ` AND r.status = '${status}'`;
    if (from) where += ` AND r.createdAt >= '${from} 00:00:00'`;
    if (to) where += ` AND r.createdAt <= '${to} 23:59:59'`;

    const redemptions: any[] = await gateway.$queryRawUnsafe(`
      SELECT r.*, pr.name as rewardName, pr.type as prType,
        rec.name as recipeName,
        u.userName
      FROM PromotionRewardRedemption r
      LEFT JOIN PromotionReward pr ON pr.id = r.promotionRewardId
      LEFT JOIN Recipe rec ON rec.id = r.chosenRecipeId
      LEFT JOIN User u ON u.userId = r.userId
      ${where}
      ORDER BY r.createdAt DESC
      LIMIT 500
    `);
    return redemptions;
  }

  async approveRedemption(tenantId: string, redemptionId: number, staffId: number, workShiftId?: number) {
    const { gateway, fnet: fnetUrl } = await this.getClients(tenantId);

    const rows: any[] = await gateway.$queryRawUnsafe(`SELECT * FROM PromotionRewardRedemption WHERE id = ?`, redemptionId);
    if (!rows.length) throw new BadRequestException('Không tìm thấy yêu cầu đổi thưởng');
    const redemption = rows[0];
    if (redemption.status !== 'PENDING') throw new BadRequestException(`Trạng thái hiện tại: ${redemption.status}, không thể duyệt`);

    let actualCost = 0;

    if (redemption.rewardType === 'PLAY_TIME') {
      // Top up FNET wallet
      if (!fnetUrl) throw new BadRequestException('Tenant chưa cấu hình FNET');
      const walletType = redemption.walletType || 'SUB';
      const amount = Number(redemption.moneyAmount) || 0;
      actualCost = amount;

      const fnetDB = await getFnetDB(fnetUrl);

      // Get current wallet
      const walletResult = await fnetDB.$queryRaw<any[]>`
        SELECT id, main, sub FROM wallettb WHERE userid = ${redemption.userId} LIMIT 1
      `;
      if (!walletResult.length) throw new BadRequestException('Không tìm thấy ví FNET');

      const wallet = walletResult[0];
      const currentMain = Number(wallet.main) || 0;
      const currentSub = Number(wallet.sub) || 0;
      let newMain = currentMain, newSub = currentSub;

      if (walletType === 'MAIN') {
        newMain = currentMain + amount;
      } else {
        newSub = currentSub + amount;
      }

      // Save FnetHistory
      if (walletType === 'MAIN') {
        await db.$executeRaw`
          INSERT INTO FnetHistory (userId, branch, oldMainMoney, newMainMoney, oldSubMoney, newSubMoney, moneyType, targetId, type, createdAt, updatedAt)
          VALUES (${redemption.userId}, 'FNET_UPDATE', ${currentMain}, ${newMain}, ${currentSub}, ${currentSub}, 'MAIN', ${redemptionId}, 'REDEMPTION', ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
        `;
      } else {
        await db.$executeRaw`
          INSERT INTO FnetHistory (userId, branch, oldSubMoney, newSubMoney, oldMainMoney, newMainMoney, moneyType, targetId, type, createdAt, updatedAt)
          VALUES (${redemption.userId}, 'FNET_UPDATE', ${currentSub}, ${newSub}, ${currentMain}, ${currentMain}, 'SUB', ${redemptionId}, 'REDEMPTION', ${getCurrentTimeVNDB()}, ${getCurrentTimeVNDB()})
        `;
      }

      // Update wallettb
      if (walletType === 'MAIN') {
        await fnetDB.$executeRaw`UPDATE wallettb SET main = ${newMain} WHERE userid = ${redemption.userId}`;
      } else {
        await fnetDB.$executeRaw`UPDATE wallettb SET sub = ${newSub} WHERE userid = ${redemption.userId}`;
      }
      await fnetDB.$executeRaw`UPDATE usertb SET RemainMoney = ${newMain + newSub} WHERE UserId = ${redemption.userId}`;

      // PLAY_TIME: auto-complete after approval
      await gateway.$executeRawUnsafe(`
        UPDATE PromotionRewardRedemption
        SET status = 'COMPLETED', actualCost = ?, workShiftId = ?, approvedBy = ?, updatedAt = NOW()
        WHERE id = ?
      `, actualCost, workShiftId || null, staffId, redemptionId);

    } else if (['FOOD', 'DRINK'].includes(redemption.rewardType)) {
      // Check stock availability before approving
      if (redemption.chosenRecipeId) {
        const chosenQty = redemption.chosenQuantity || 1;
        const stockCheck: any[] = await gateway.$queryRawUnsafe(`
          SELECT m.name as materialName, m.baseUnit,
            m.quantityInStock as stock,
            (ri.quantity * ?) as needed
          FROM RecipeItem ri
          JOIN Material m ON m.id = ri.materialId
          JOIN RecipeVersion rv ON rv.id = ri.recipeVersionId
          WHERE rv.recipeId = ? AND rv.isActive = true
            AND m.quantityInStock < (ri.quantity * ?)
        `, chosenQty, redemption.chosenRecipeId, chosenQty);

        if (stockCheck.length > 0) {
          const outOfStock = stockCheck.map((s: any) =>
            `${s.materialName} (còn ${Number(s.stock)} ${s.baseUnit}, cần ${Number(s.needed)} ${s.baseUnit})`
          ).join(', ');
          throw new BadRequestException(`Không đủ nguyên liệu: ${outOfStock}`);
        }

        // Get recipe info + active version for order creation
        const recipeRows: any[] = await gateway.$queryRawUnsafe(
          `SELECT id, name, salePrice FROM Recipe WHERE id = ?`, redemption.chosenRecipeId,
        );
        const recipe = recipeRows[0];
        const recipeName = recipe?.name || `Recipe #${redemption.chosenRecipeId}`;
        const salePrice = Number(recipe?.salePrice) || 0;

        const versionRows: any[] = await gateway.$queryRawUnsafe(`
          SELECT rv.id, rv.recipeId FROM RecipeVersion rv
          WHERE rv.recipeId = ? AND rv.isActive = true
          ORDER BY rv.effectiveFrom DESC LIMIT 1
        `, redemption.chosenRecipeId);
        const activeVersion = versionRows[0];

        // Get recipe ingredients for cost calculation and stock deduction
        const ingredients: any[] = await gateway.$queryRawUnsafe(`
          SELECT ri.materialId, ri.quantity, m.costPrice, m.name as materialName
          FROM RecipeItem ri
          JOIN Material m ON m.id = ri.materialId
          JOIN RecipeVersion rv ON rv.id = ri.recipeVersionId
          WHERE rv.recipeId = ? AND rv.isActive = true
        `, redemption.chosenRecipeId);

        // Calculate actual cost
        actualCost = ingredients.reduce((sum: number, ing: any) =>
          sum + Number(ing.quantity) * Number(ing.costPrice) * chosenQty, 0);

        // Deduct stock and create inventory transactions
        const tenantIdInt = parseInt(tenantId) || 1;
        for (const ing of ingredients) {
          const deduction = Number(ing.quantity) * chosenQty;
          await gateway.$executeRawUnsafe(
            `UPDATE Material SET quantityInStock = quantityInStock - ? WHERE id = ?`,
            deduction, ing.materialId,
          );
          await gateway.$executeRawUnsafe(`
            INSERT INTO InventoryTransaction (materialId, type, quantityChange, reason, referenceId, staffId, tenantId, createdAt)
            VALUES (?, 'REDEMPTION', ?, ?, ?, ?, ?, NOW())
          `, ing.materialId, -deduction, `Đổi thưởng: ${recipeName}`, String(redemptionId), staffId, tenantIdInt);
        }

        // Create FoodOrder for FOOD/DRINK reward
        const subtotal = salePrice * chosenQty;
        const recipeSnapshot = JSON.stringify(ingredients.map((ing: any) => ({
          materialId: Number(ing.materialId), quantity: Number(ing.quantity), materialName: ing.materialName,
        })));

        await gateway.$executeRawUnsafe(`
          INSERT INTO FoodOrder (userId, macAddress, computerName, tenantId, status, totalAmount, note, createdAt, updatedAt)
          VALUES (?, 'REWARD_REDEMPTION', NULL, ?, 'HOAN_THANH', ?, ?, NOW(), NOW())
        `, redemption.userId, tenantIdInt, subtotal, `Đổi thưởng #${redemptionId}: ${recipeName}`);

        const orderIdRows: any[] = await gateway.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as lastId`);
        const orderId = Number(orderIdRows[0]?.lastId);

        await gateway.$executeRawUnsafe(`
          INSERT INTO FoodOrderDetail (orderId, recipeId, recipeVersionId, recipeName, salePrice, quantity, subtotal, note, recipeSnapshot)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, orderId, redemption.chosenRecipeId, activeVersion?.id || 0, recipeName, salePrice, chosenQty, subtotal,
           `Đổi thưởng #${redemptionId}`, recipeSnapshot);

        await gateway.$executeRawUnsafe(`
          INSERT INTO FoodOrderStatusHistory (orderId, status, changedBy, note, changedAt)
          VALUES (?, 'HOAN_THANH', ?, ?, NOW())
        `, orderId, staffId, `Đổi thưởng tự động #${redemptionId}`);
      }

      await gateway.$executeRawUnsafe(`
        UPDATE PromotionRewardRedemption
        SET status = 'COMPLETED', actualCost = ?, workShiftId = ?, approvedBy = ?, updatedAt = NOW()
        WHERE id = ?
      `, actualCost, workShiftId || null, staffId, redemptionId);

    } else {
      // VOUCHER, OTHER
      await gateway.$executeRawUnsafe(`
        UPDATE PromotionRewardRedemption
        SET status = 'COMPLETED', actualCost = 0, workShiftId = ?, approvedBy = ?, updatedAt = NOW()
        WHERE id = ?
      `, workShiftId || null, staffId, redemptionId);
    }

    return { success: true, userId: Number(redemption.userId) };
  }

  async rejectRedemption(tenantId: string, redemptionId: number, note?: string) {
    const { gateway } = await this.getClients(tenantId);
    const rows: any[] = await gateway.$queryRawUnsafe(`SELECT * FROM PromotionRewardRedemption WHERE id = ?`, redemptionId);
    if (!rows.length) throw new BadRequestException('Không tìm thấy');
    const redemption = rows[0];
    if (redemption.status !== 'PENDING') throw new BadRequestException('Chỉ có thể từ chối yêu cầu đang chờ duyệt');

    // Refund stars
    const users: any[] = await gateway.$queryRawUnsafe(`SELECT stars FROM User WHERE userId = ?`, redemption.userId);
    if (users.length) {
      const oldStars = users[0].stars;
      const newStars = oldStars + redemption.starsCost;
      await gateway.$executeRawUnsafe(`UPDATE User SET stars = ? WHERE userId = ?`, newStars, redemption.userId);
      await gateway.$executeRawUnsafe(`
        INSERT INTO UserStarHistory (userId, oldStars, newStars, type, targetId, createdAt)
        VALUES (?, ?, ?, 'REDEMPTION', ?, ?)
      `, redemption.userId, oldStars, newStars, redemptionId, getCurrentTimeVNDB());
    }

    await gateway.$executeRawUnsafe(`
      UPDATE PromotionRewardRedemption SET status = 'REJECTED', note = ?, updatedAt = NOW() WHERE id = ?
    `, note || 'Từ chối bởi admin', redemptionId);
    return { success: true, userId: Number(redemption.userId) };
  }

  // ─── Reports ───

  async getReportSummary(tenantId: string, from: string, to: string, workShiftId?: number, rewardType?: string) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);

    let redemptionWhere = `WHERE r.createdAt >= '${from} 00:00:00' AND r.createdAt <= '${to} 23:59:59' AND r.status != 'REJECTED'`;
    if (workShiftId) redemptionWhere += ` AND r.workShiftId = ${workShiftId}`;
    if (rewardType) redemptionWhere += ` AND r.rewardType = '${rewardType}'`;

    // Stars distributed (all types)
    const starsDistributed: any[] = await gateway.$queryRawUnsafe(`
      SELECT type, COALESCE(SUM(newStars - oldStars), 0) as total
      FROM UserStarHistory
      WHERE createdAt >= '${from} 00:00:00' AND createdAt <= '${to} 23:59:59'
        AND (newStars - oldStars) > 0
      GROUP BY type
    `);

    // Stars consumed (redemptions)
    const starsConsumed: any[] = await gateway.$queryRawUnsafe(`
      SELECT COALESCE(SUM(r.starsCost), 0) as total
      FROM PromotionRewardRedemption r
      ${redemptionWhere}
    `);

    // By type
    const byType: any[] = await gateway.$queryRawUnsafe(`
      SELECT r.rewardType, COUNT(*) as count,
        COALESCE(SUM(r.starsCost), 0) as starsUsed,
        COALESCE(SUM(r.actualCost), 0) as actualCost
      FROM PromotionRewardRedemption r
      ${redemptionWhere}
      GROUP BY r.rewardType
    `);

    // By status
    const byStatus: any[] = await gateway.$queryRawUnsafe(`
      SELECT status, COUNT(*) as count
      FROM PromotionRewardRedemption
      WHERE createdAt >= '${from} 00:00:00' AND createdAt <= '${to} 23:59:59'
      GROUP BY status
    `);

    // By shift
    const byShift: any[] = await gateway.$queryRawUnsafe(`
      SELECT r.workShiftId, ws.name as shiftName,
        COUNT(*) as count,
        COALESCE(SUM(r.starsCost), 0) as starsUsed,
        COALESCE(SUM(r.actualCost), 0) as actualCost
      FROM PromotionRewardRedemption r
      LEFT JOIN WorkShift ws ON ws.id = r.workShiftId
      ${redemptionWhere}
      GROUP BY r.workShiftId, ws.name
    `);

    // Top rewards
    const topRewards: any[] = await gateway.$queryRawUnsafe(`
      SELECT pr.name as rewardName, r.rewardType,
        COUNT(*) as count,
        COALESCE(SUM(r.starsCost), 0) as starsUsed,
        COALESCE(SUM(r.actualCost), 0) as totalCost
      FROM PromotionRewardRedemption r
      JOIN PromotionReward pr ON pr.id = r.promotionRewardId
      ${redemptionWhere}
      GROUP BY r.promotionRewardId, pr.name, r.rewardType
      ORDER BY count DESC
      LIMIT 10
    `);

    // Daily breakdown
    const daily: any[] = await gateway.$queryRawUnsafe(`
      SELECT DATE(r.createdAt) as date,
        COUNT(*) as count,
        COALESCE(SUM(r.starsCost), 0) as starsUsed,
        COALESCE(SUM(r.actualCost), 0) as actualCost
      FROM PromotionRewardRedemption r
      ${redemptionWhere}
      GROUP BY DATE(r.createdAt)
      ORDER BY date ASC
    `);

    // Total
    const totalRedeemed = Number(starsConsumed[0]?.total) || 0;
    const totalDistributed = starsDistributed.reduce((s: number, r: any) => s + Number(r.total), 0);
    const totalCost = byType.reduce((s: number, r: any) => s + Number(r.actualCost), 0);
    const totalCount = byType.reduce((s: number, r: any) => s + Number(r.count), 0);

    return {
      period: { from, to },
      stars: {
        totalDistributed,
        totalRedeemed,
        netBalance: totalDistributed - totalRedeemed,
        distributed: starsDistributed.reduce((acc: any, r: any) => {
          acc[r.type] = Number(r.total);
          return acc;
        }, {}),
      },
      redemptions: {
        total: totalCount,
        totalActualCost: totalCost,
        byType: byType.reduce((acc: any, r: any) => {
          acc[r.rewardType] = { count: Number(r.count), starsUsed: Number(r.starsUsed), actualCost: Number(r.actualCost) };
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc: any, r: any) => {
          acc[r.status] = Number(r.count);
          return acc;
        }, {}),
      },
      byShift: byShift.map((s: any) => ({
        workShiftId: s.workShiftId,
        shiftName: s.shiftName || 'Không xác định',
        count: Number(s.count),
        starsUsed: Number(s.starsUsed),
        actualCost: Number(s.actualCost),
      })),
      topRewards: topRewards.map((r: any) => ({
        rewardName: r.rewardName,
        rewardType: r.rewardType,
        count: Number(r.count),
        starsUsed: Number(r.starsUsed),
        totalCost: Number(r.totalCost),
      })),
      daily: daily.map((d: any) => ({
        date: d.date,
        count: Number(d.count),
        starsUsed: Number(d.starsUsed),
        actualCost: Number(d.actualCost),
      })),
    };
  }

  // ─── Client: My history ───

  async getMyHistory(tenantId: string, userId: number) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway);
    const rows: any[] = await gateway.$queryRawUnsafe(`
      SELECT r.*, pr.name as rewardName, rec.name as recipeName, rec.imageUrl as recipeImageUrl
      FROM PromotionRewardRedemption r
      LEFT JOIN PromotionReward pr ON pr.id = r.promotionRewardId
      LEFT JOIN Recipe rec ON rec.id = r.chosenRecipeId
      WHERE r.userId = ?
      ORDER BY r.createdAt DESC
      LIMIT 50
    `, userId);
    return rows.map((r: any) => ({
      ...r,
      id: Number(r.id),
      starsCost: Number(r.starsCost),
      promotionRewardId: Number(r.promotionRewardId),
      chosenRecipeId: r.chosenRecipeId ? Number(r.chosenRecipeId) : null,
      actualCost: r.actualCost ? Number(r.actualCost) : null,
    }));
  }
}
