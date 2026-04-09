import { Injectable } from '@nestjs/common';
import { redis } from '../../lib/redis';
import { MenuCampaignService } from './menu-campaign.service';
import dayjs from 'dayjs';

export interface OrderItem {
  recipeId: number;
  categoryId: number;
  salePrice: number;
  quantity: number;
}

export interface DiscountResult {
  campaignId: number | null;
  campaignName: string | null;
  discountType: string | null;
  discountPerItem: { recipeId: number; discount: number }[];
  totalDiscount: number;
}

const NO_DISCOUNT: DiscountResult = { campaignId: null, campaignName: null, discountType: null, discountPerItem: [], totalDiscount: 0 };

@Injectable()
export class CampaignEngineService {
  constructor(private readonly campaignService: MenuCampaignService) {}

  // ─── Redis keys ───

  private budgetKey(tenantId: string, campaignId: number) { return `mc:${tenantId}:budget:${campaignId}`; }
  private usageKey(tenantId: string, campaignId: number, userId: number) { return `mc:${tenantId}:usage:${campaignId}:${userId}`; }
  private dailyKey(tenantId: string, campaignId: number, userId: number) {
    return `mc:${tenantId}:daily:${campaignId}:${userId}:${dayjs().format('YYYY-MM-DD')}`;
  }
  private activeCacheKey(tenantId: string) { return `mc:${tenantId}:active`; }

  // ─── 1. Load active campaigns (Redis cache or DB) ───

  private async loadActiveCampaigns(tenantId: string, gateway: any): Promise<any[]> {
    const cacheKey = this.activeCacheKey(tenantId);
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const campaigns: any[] = await gateway.$queryRawUnsafe(`
      SELECT mc.*, GROUP_CONCAT(DISTINCT ms.scopeType, ':', IFNULL(ms.targetId,'')) as menuScopeRaw,
             GROUP_CONCAT(DISTINCT cs.scopeType, ':', IFNULL(cs.targetId,'')) as customerScopeRaw
      FROM MenuCampaign mc
      LEFT JOIN MenuCampaignMenuScope ms ON ms.campaignId = mc.id
      LEFT JOIN MenuCampaignCustomerScope cs ON cs.campaignId = mc.id
      WHERE mc.status = 'ACTIVE' AND mc.startDate <= ? AND mc.endDate >= ?
      GROUP BY mc.id
      ORDER BY mc.priority DESC
    `, now, now);

    // Parse scopes + load timeSlots + comboRules
    for (const c of campaigns) {
      c.id = Number(c.id);
      c.discountValue = Number(c.discountValue);
      c.totalBudget = c.totalBudget != null ? Number(c.totalBudget) : null;
      c.spentBudget = Number(c.spentBudget);
      c.priority = Number(c.priority);
      c.minOrderValue = c.minOrderValue != null ? Number(c.minOrderValue) : null;
      c.maxDiscountAmount = c.maxDiscountAmount != null ? Number(c.maxDiscountAmount) : null;
      c.maxUsesPerUserPerCampaign = c.maxUsesPerUserPerCampaign != null ? Number(c.maxUsesPerUserPerCampaign) : null;
      c.maxUsesPerUserPerDay = c.maxUsesPerUserPerDay != null ? Number(c.maxUsesPerUserPerDay) : null;
      c.requiredBpLevel = c.requiredBpLevel != null ? Number(c.requiredBpLevel) : null;
      c.requiredBpSeasonId = c.requiredBpSeasonId != null ? Number(c.requiredBpSeasonId) : null;
      c.newMemberDaysThreshold = c.newMemberDaysThreshold != null ? Number(c.newMemberDaysThreshold) : null;

      c.menuScopes = (c.menuScopeRaw || '').split(',').filter(Boolean).map((s: string) => {
        const [scopeType, targetId] = s.split(':');
        return { scopeType, targetId: targetId ? Number(targetId) : null };
      });
      c.customerScopes = (c.customerScopeRaw || '').split(',').filter(Boolean).map((s: string) => {
        const [scopeType, targetId] = s.split(':');
        return { scopeType, targetId: targetId ? Number(targetId) : null };
      });
      delete c.menuScopeRaw;
      delete c.customerScopeRaw;

      c.timeSlots = (await gateway.$queryRawUnsafe(`SELECT * FROM MenuCampaignTimeSlot WHERE campaignId = ?`, c.id))
        .map((t: any) => ({ dayOfWeek: t.dayOfWeek != null ? Number(t.dayOfWeek) : null, startTime: t.startTime, endTime: t.endTime }));
      c.comboRules = (await gateway.$queryRawUnsafe(`SELECT * FROM MenuCampaignComboRule WHERE campaignId = ?`, c.id))
        .map((r: any) => ({ categoryId: Number(r.categoryId), minQuantity: Number(r.minQuantity) }));
    }

    await redis.set(cacheKey, JSON.stringify(campaigns), 'EX', 60);
    return campaigns;
  }

  // ─── 2. Filter by Customer Scope ───

  private matchCustomerScope(campaign: any, userId: number, rankId: number, machineGroupId: number | null): boolean {
    if (!campaign.customerScopes?.length) return true;
    return campaign.customerScopes.some((s: any) => {
      switch (s.scopeType) {
        case 'ALL_CUSTOMERS': return true;
        case 'RANK': return s.targetId === rankId;
        case 'MACHINE_GROUP': return s.targetId === machineGroupId;
        case 'SPECIFIC_USER': return s.targetId === userId;
        case 'NEW_MEMBER': return true; // checked separately
        default: return false;
      }
    });
  }

  // ─── 3. Filter by Menu Scope ───

  private getMatchingItems(campaign: any, items: OrderItem[]): OrderItem[] {
    if (!campaign.menuScopes?.length) return items;
    const hasAll = campaign.menuScopes.some((s: any) => s.scopeType === 'ALL');
    if (hasAll) return items;

    const catIds = new Set(campaign.menuScopes.filter((s: any) => s.scopeType === 'CATEGORY').map((s: any) => s.targetId));
    const recipeIds = new Set(campaign.menuScopes.filter((s: any) => s.scopeType === 'RECIPE').map((s: any) => s.targetId));

    return items.filter(i => catIds.has(i.categoryId) || recipeIds.has(i.recipeId));
  }

  // ─── 4. Filter by Time Slot (Happy Hour) ───

  private matchTimeSlot(campaign: any): boolean {
    if (!campaign.timeSlots?.length) return true;
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return campaign.timeSlots.some((slot: any) => {
      const dayMatch = slot.dayOfWeek == null || slot.dayOfWeek === currentDay;
      const timeMatch = currentTime >= slot.startTime && currentTime <= slot.endTime;
      return dayMatch && timeMatch;
    });
  }

  // ─── 5. Check Constraints ───

  private async checkConstraints(
    campaign: any, tenantId: string, userId: number, orderTotal: number,
  ): Promise<boolean> {
    // Min order value
    if (campaign.minOrderValue && orderTotal < campaign.minOrderValue) return false;

    // Budget check (Redis)
    if (campaign.totalBudget) {
      const spent = await redis.get(this.budgetKey(tenantId, campaign.id));
      if (spent && Number(spent) >= campaign.totalBudget) return false;
    }

    // Per-user per-campaign limit
    if (campaign.maxUsesPerUserPerCampaign) {
      const used = await redis.get(this.usageKey(tenantId, campaign.id, userId));
      if (used && Number(used) >= campaign.maxUsesPerUserPerCampaign) return false;
    }

    // Per-user per-day limit
    if (campaign.maxUsesPerUserPerDay) {
      const daily = await redis.get(this.dailyKey(tenantId, campaign.id, userId));
      if (daily && Number(daily) >= campaign.maxUsesPerUserPerDay) return false;
    }

    return true;
  }

  // ─── 6. Calculate Discount ───

  private calculateDiscount(campaign: any, matchingItems: OrderItem[]): { discountPerItem: { recipeId: number; discount: number }[]; total: number } {
    const discountPerItem: { recipeId: number; discount: number }[] = [];
    let total = 0;

    for (const item of matchingItems) {
      let discount = 0;
      const itemTotal = item.salePrice * item.quantity;

      switch (campaign.discountType) {
        case 'PERCENTAGE':
          discount = itemTotal * Number(campaign.discountValue) / 100;
          break;
        case 'FIXED_AMOUNT':
          discount = Math.min(Number(campaign.discountValue) * item.quantity, itemTotal);
          break;
        case 'FLAT_PRICE':
          discount = Math.max(0, itemTotal - Number(campaign.discountValue) * item.quantity);
          break;
        case 'COMBO_DEAL':
          // Combo: check if all required categories are in order
          if (this.checkComboRules(campaign, matchingItems)) {
            discount = itemTotal * Number(campaign.discountValue) / 100;
          }
          break;
      }

      // Apply cap
      if (campaign.maxDiscountAmount) {
        discount = Math.min(discount, campaign.maxDiscountAmount);
      }

      discount = Math.round(discount);
      discountPerItem.push({ recipeId: item.recipeId, discount });
      total += discount;
    }

    // Apply total cap if budget remaining < total discount
    if (campaign.totalBudget) {
      const remaining = campaign.totalBudget - campaign.spentBudget;
      if (total > remaining) total = Math.max(0, remaining);
    }

    return { discountPerItem, total };
  }

  private checkComboRules(campaign: any, items: OrderItem[]): boolean {
    if (!campaign.comboRules?.length) return true;
    return campaign.comboRules.every((rule: any) => {
      const qty = items.filter(i => i.categoryId === rule.categoryId).reduce((sum, i) => sum + i.quantity, 0);
      return qty >= rule.minQuantity;
    });
  }

  // ─── Main: Evaluate Discounts at Checkout ───

  async evaluateDiscounts(
    tenantId: string,
    userId: number,
    rankId: number,
    machineGroupId: number | null,
    items: OrderItem[],
  ): Promise<DiscountResult> {
    if (!items.length) return NO_DISCOUNT;

    const { gateway } = await this.campaignService.getClients(tenantId);
    await this.campaignService.ensureSchema(gateway, tenantId);

    // Step 1: Load active campaigns
    const campaigns = await this.loadActiveCampaigns(tenantId, gateway);
    if (!campaigns.length) return NO_DISCOUNT;

    const orderTotal = items.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
    let bestResult: DiscountResult = NO_DISCOUNT;
    let bestPriority = -1;

    for (const campaign of campaigns) {
      // Step 2: Customer scope
      if (!this.matchCustomerScope(campaign, userId, rankId, machineGroupId)) continue;

      // Step 3: Menu scope
      const matchingItems = this.getMatchingItems(campaign, items);
      if (!matchingItems.length) continue;

      // Step 4: Time slot
      if (!this.matchTimeSlot(campaign)) continue;

      // Step 5: Constraints
      if (!(await this.checkConstraints(campaign, tenantId, userId, orderTotal))) continue;

      // Step 6: Calculate
      const { discountPerItem, total } = this.calculateDiscount(campaign, matchingItems);
      if (total <= 0) continue;

      // Step 7: Select best (highest priority, then highest discount)
      if (campaign.priority > bestPriority || (campaign.priority === bestPriority && total > bestResult.totalDiscount)) {
        bestResult = {
          campaignId: campaign.id,
          campaignName: campaign.name,
          discountType: campaign.discountType,
          discountPerItem,
          totalDiscount: total,
        };
        bestPriority = campaign.priority;
      }
    }

    return bestResult;
  }

  // ─── Apply Discount (after order confirmed) ───

  async applyDiscount(tenantId: string, campaignId: number, userId: number, orderId: number, discountAmount: number, gateway: any) {
    // Record usage
    await gateway.$executeRawUnsafe(
      `INSERT INTO MenuCampaignUsage (campaignId, userId, orderId, discountAmount) VALUES (?, ?, ?, ?)`,
      campaignId, userId, orderId, discountAmount,
    );

    // Redis atomic updates
    await redis.incrby(this.budgetKey(tenantId, campaignId), discountAmount);
    await redis.incr(this.usageKey(tenantId, campaignId, userId));
    const dailyKey = this.dailyKey(tenantId, campaignId, userId);
    await redis.incr(dailyKey);
    await redis.expire(dailyKey, 86400);

    // Update DB counters
    await gateway.$executeRawUnsafe(
      `UPDATE MenuCampaign SET spentBudget = spentBudget + ?, totalUsageCount = totalUsageCount + 1 WHERE id = ?`,
      discountAmount, campaignId,
    );

    // Check if budget exceeded → auto-pause
    const rows: any[] = await gateway.$queryRawUnsafe(`SELECT totalBudget, spentBudget FROM MenuCampaign WHERE id = ?`, campaignId);
    if (rows.length && rows[0].totalBudget && Number(rows[0].spentBudget) >= Number(rows[0].totalBudget)) {
      await gateway.$executeRawUnsafe(`UPDATE MenuCampaign SET status = 'BUDGET_EXCEEDED' WHERE id = ?`, campaignId);
      // Invalidate cache
      await redis.del(this.activeCacheKey(tenantId));
    }
  }

  // ─── Rollback (on order cancel) ───

  async rollbackDiscount(tenantId: string, orderId: number, gateway: any) {
    const usages: any[] = await gateway.$queryRawUnsafe(
      `SELECT campaignId, userId, discountAmount FROM MenuCampaignUsage WHERE orderId = ?`, orderId,
    );
    for (const u of usages) {
      const campaignId = Number(u.campaignId);
      const userId = Number(u.userId);
      const amount = Number(u.discountAmount);

      await redis.decrby(this.budgetKey(tenantId, campaignId), amount);
      await redis.decr(this.usageKey(tenantId, campaignId, userId));

      await gateway.$executeRawUnsafe(
        `UPDATE MenuCampaign SET spentBudget = GREATEST(0, spentBudget - ?), totalUsageCount = GREATEST(0, totalUsageCount - 1) WHERE id = ?`,
        amount, campaignId,
      );
    }
    await gateway.$executeRawUnsafe(`DELETE FROM MenuCampaignUsage WHERE orderId = ?`, orderId);
  }

  // ─── Cache invalidation ───

  async invalidateCache(tenantId: string) {
    await redis.del(this.activeCacheKey(tenantId));
  }

  // ─── Budget progress (for client) ───

  async getBudgetProgress(tenantId: string, campaignId: number) {
    const { gateway } = await this.campaignService.getClients(tenantId);
    const rows: any[] = await gateway.$queryRawUnsafe(
      `SELECT totalBudget, spentBudget, name, status FROM MenuCampaign WHERE id = ?`, campaignId,
    );
    if (!rows.length) return null;
    const c = rows[0];
    const total = Number(c.totalBudget) || 0;
    const spent = Number(c.spentBudget) || 0;
    return {
      campaignId,
      name: c.name,
      status: c.status,
      totalBudget: total,
      spentBudget: spent,
      remaining: Math.max(0, total - spent),
      percentUsed: total > 0 ? Math.round((spent / total) * 100) : 0,
    };
  }
}
