import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService, FnetPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { redisService } from '../../lib/redis-service';

@Injectable()
export class MenuService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly fnetPrisma: FnetPrismaService,
  ) {}

  private async getFnetClient(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');
    if (!tenant.fnetUrl) throw new BadRequestException('Tenant chưa cấu hình fnetUrl');
    return this.fnetPrisma.getClient(tenant.fnetUrl);
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

  // --- Categories ---
  async findAllCategories(tenantId: string) {
    const db = await this.getGatewayClient(tenantId);
    return db.menuCategory.findMany({
      where: { tenantId: parseInt(tenantId) || 1 },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { recipes: true } } },
    });
  }

  async createCategory(tenantId: string, dto: { name: string; sortOrder?: number; requiredCategoryIds?: string | null }) {
    const db = await this.getGatewayClient(tenantId);
    return (db.menuCategory.create as any)({
      data: { name: dto.name, sortOrder: dto.sortOrder ?? 0, tenantId: parseInt(tenantId) || 1, requiredCategoryIds: dto.requiredCategoryIds ?? null },
    });
  }

  async updateCategory(tenantId: string, id: number, dto: {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
    scheduleEnabled?: boolean;
    scheduleTimeStart?: string | null;
    scheduleTimeEnd?: string | null;
    scheduleDateStart?: Date | null;
    scheduleDateEnd?: Date | null;
    scheduleMachineGroupIds?: string | null;
    requiredCategoryIds?: string | null;
  }) {
    const db = await this.getGatewayClient(tenantId);
    return (db.menuCategory.update as any)({ where: { id }, data: dto });
  }

  async getMachineGroups(tenantId: string) {
    const fnet = await this.getFnetClient(tenantId);
    return fnet.$queryRawUnsafe<{ MachineGroupId: number; MachineGroupName: string }[]>(
      `SELECT MachineGroupId, MachineGroupName FROM machinegrouptb WHERE Active = 1 ORDER BY MachineGroupName ASC`
    );
  }

  /** Dùng cho client app: lọc category theo lịch hẹn giờ + nhóm máy */
  async findClientCategories(tenantId: string, machineGroupId: number | null) {
    const db = await this.getGatewayClient(tenantId);
    const all = await db.menuCategory.findMany({
      where: { tenantId: parseInt(tenantId) || 1, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return all.filter((cat) => {
      if (!cat.scheduleEnabled) return true;

      // Kiểm tra khoảng ngày
      if (cat.scheduleDateStart && currentDate < new Date(cat.scheduleDateStart.getFullYear(), cat.scheduleDateStart.getMonth(), cat.scheduleDateStart.getDate())) return false;
      if (cat.scheduleDateEnd && currentDate > new Date(cat.scheduleDateEnd.getFullYear(), cat.scheduleDateEnd.getMonth(), cat.scheduleDateEnd.getDate())) return false;

      // Kiểm tra khoảng giờ
      if (cat.scheduleTimeStart && cat.scheduleTimeEnd) {
        if (currentTime < cat.scheduleTimeStart || currentTime > cat.scheduleTimeEnd) return false;
      }

      // Kiểm tra nhóm máy
      if (cat.scheduleMachineGroupIds) {
        const allowedIds: number[] = JSON.parse(cat.scheduleMachineGroupIds);
        if (allowedIds.length > 0 && machineGroupId !== null && !allowedIds.includes(machineGroupId)) return false;
      }

      return true;
    });
  }

  async reorderCategories(tenantId: string, orders: { id: number; sortOrder: number }[]) {
    const db = await this.getGatewayClient(tenantId);
    await Promise.all(
      orders.map(({ id, sortOrder }) =>
        db.menuCategory.update({ where: { id }, data: { sortOrder } })
      )
    );
    return { success: true };
  }

  async deleteCategory(tenantId: string, id: number) {
    const db = await this.getGatewayClient(tenantId);
    const tid = parseInt(tenantId) || 1;
    // Xoá categoryId gốc
    await db.recipe.updateMany({
      where: { categoryId: id, tenantId: tid },
      data: { categoryId: null },
    });
    // Xoá khỏi secondaryCategoryIds
    const recipesWithSecondary = await db.recipe.findMany({
      where: { tenantId: tid, secondaryCategoryIds: { not: null } },
      select: { id: true, secondaryCategoryIds: true },
    });
    await Promise.all(
      recipesWithSecondary
        .filter((r) => {
          const ids: number[] = JSON.parse(r.secondaryCategoryIds!);
          return ids.includes(id);
        })
        .map((r) => {
          const ids: number[] = JSON.parse(r.secondaryCategoryIds!);
          const updated = ids.filter((cid) => cid !== id);
          return db.recipe.update({
            where: { id: r.id },
            data: { secondaryCategoryIds: updated.length ? JSON.stringify(updated) : null },
          });
        }),
    );
    await this.invalidateAllMenuCache(tenantId);
    return db.menuCategory.delete({ where: { id } });
  }

  // --- Menu items ---
  private menuCacheKey(tenantId: string, userId: number) {
    return `${tenantId}:menu:items:${userId}`;
  }

  async findAllMenuItems(tenantId: string, userId: number) {
    const cacheKey = this.menuCacheKey(tenantId, userId);
    const cached = await redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const db = await this.getGatewayClient(tenantId);
    const tid = parseInt(tenantId) || 1;

    const recipes = await db.recipe.findMany({
      where: { tenantId: tid },
      include: {
        category: { select: { id: true, name: true } },
        versions: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
          include: {
            items: {
              include: {
                material: { select: { id: true, name: true, baseUnit: true } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Stock calculation – prefer Redis (reflects reserved amounts) with DB fallback
    const materialIds = [
      ...new Set(recipes.flatMap((r) => r.versions[0]?.items.map((i) => i.materialId) ?? [])),
    ];
    const stockMap = new Map<number, number>();
    if (materialIds.length) {
      const dbMaterials = await db.material.findMany({
        where: { id: { in: materialIds }, tenantId: tid },
        select: { id: true, quantityInStock: true },
      });
      const dbStockMap = new Map(dbMaterials.map((m) => [m.id, Number(m.quantityInStock ?? 0)]));

      for (const matId of materialIds) {
        const redisVal = await redisService.get(`${tenantId}:stock:${matId}`);
        stockMap.set(matId, redisVal !== null ? parseFloat(redisVal) : (dbStockMap.get(matId) ?? 0));
      }
    }

    // Restock requests submitted by this user
    const restockFeedbacks = await db.feedback.findMany({
      where: {
        userId,
        type: 'RESTOCK_REQUEST' as any,
        status: { in: ['SUBMITTED', 'RECEIVED', 'PROCESSING'] as any },
        itemId: { not: null },
      },
      select: { itemId: true },
    });
    const requestedItemIds = new Set(restockFeedbacks.map((f) => f.itemId));

    const data = recipes.map((recipe) => {
      const ingredients = recipe.versions[0]?.items ?? [];
      let availablePortions: number | null = null;
      if (ingredients.length > 0) {
        const min = ingredients.reduce((acc, ingredient) => {
          const stock = stockMap.get(ingredient.materialId) ?? 0;
          const qty = Number(ingredient.quantity);
          return Math.min(acc, qty > 0 ? Math.floor(stock / qty) : Infinity);
        }, Infinity);
        if (isFinite(min)) availablePortions = min;
      }

      return { ...recipe, availablePortions, isFeedback: requestedItemIds.has(recipe.id) };
    });

    await redisService.setex(cacheKey, 300, data);
    return data;
  }

  async invalidateMenuCacheForUser(tenantId: string, userId: number) {
    await redisService.del(this.menuCacheKey(tenantId, userId));
  }

  async invalidateAllMenuCache(tenantId: string) {
    const keys = await redisService.keys(`${tenantId}:menu:items:*`);
    await Promise.all(keys.map((k) => redisService.del(k)));
  }

  async updateMenuItem(tenantId: string, id: number, dto: { categoryId?: number | null; salePrice?: number; imageUrl?: string | null; isActive?: boolean }) {
    const db = await this.getGatewayClient(tenantId);
    const result = await db.recipe.update({ where: { id }, data: dto });
    await this.invalidateAllMenuCache(tenantId);
    return result;
  }

  async bulkAssignCategory(tenantId: string, categoryId: number | null, recipeIds: number[]) {
    const db = await this.getGatewayClient(tenantId);
    const result = await db.recipe.updateMany({
      where: { id: { in: recipeIds }, tenantId: parseInt(tenantId) || 1 },
      data: { categoryId },
    });
    await this.invalidateAllMenuCache(tenantId);
    return result;
  }

  /**
   * Thêm categoryId vào secondaryCategoryIds cho các recipes.
   * Giữ nguyên categoryId gốc, chỉ thêm vào danh sách phụ.
   */
  async addSecondaryCategory(tenantId: string, categoryId: number, recipeIds: number[]) {
    const db = await this.getGatewayClient(tenantId);
    const tid = parseInt(tenantId) || 1;
    const recipes = await db.recipe.findMany({
      where: { id: { in: recipeIds }, tenantId: tid },
      select: { id: true, secondaryCategoryIds: true },
    });
    await Promise.all(
      recipes.map((r) => {
        const existing: number[] = r.secondaryCategoryIds ? JSON.parse(r.secondaryCategoryIds) : [];
        if (!existing.includes(categoryId)) {
          existing.push(categoryId);
        }
        return db.recipe.update({
          where: { id: r.id },
          data: { secondaryCategoryIds: JSON.stringify(existing) },
        });
      }),
    );
    await this.invalidateAllMenuCache(tenantId);
  }

  /**
   * Xoá categoryId khỏi secondaryCategoryIds cho các recipes.
   */
  async removeSecondaryCategory(tenantId: string, categoryId: number, recipeIds: number[]) {
    const db = await this.getGatewayClient(tenantId);
    const tid = parseInt(tenantId) || 1;
    const recipes = await db.recipe.findMany({
      where: { id: { in: recipeIds }, tenantId: tid },
      select: { id: true, secondaryCategoryIds: true },
    });
    await Promise.all(
      recipes.map((r) => {
        const existing: number[] = r.secondaryCategoryIds ? JSON.parse(r.secondaryCategoryIds) : [];
        const updated = existing.filter((id) => id !== categoryId);
        return db.recipe.update({
          where: { id: r.id },
          data: { secondaryCategoryIds: updated.length ? JSON.stringify(updated) : null },
        });
      }),
    );
    await this.invalidateAllMenuCache(tenantId);
  }

  async findMenuItemById(tenantId: string, id: number) {
    const db = await this.getGatewayClient(tenantId);
    return db.recipe.findFirst({
      where: { id, tenantId: parseInt(tenantId) || 1 },
      include: {
        category: { select: { id: true, name: true } },
        versions: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
          include: {
            items: {
              include: {
                material: { select: { id: true, name: true, baseUnit: true } },
              },
            },
          },
        },
      },
    });
  }

  async createMenuItem(tenantId: string, dto: { name: string; salePrice?: number; categoryId?: number; imageUrl?: string }) {
    const db = await this.getGatewayClient(tenantId);
    const result = await db.recipe.create({
      data: {
        name: dto.name,
        salePrice: dto.salePrice || 0,
        categoryId: dto.categoryId || null,
        imageUrl: dto.imageUrl || null,
        tenantId: parseInt(tenantId) || 1,
      },
    });
    await this.invalidateAllMenuCache(tenantId);
    return result;
  }
}
