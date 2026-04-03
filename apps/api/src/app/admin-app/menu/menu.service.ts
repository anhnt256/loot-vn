import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';

@Injectable()
export class MenuService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService
  ) {}

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

  async createCategory(tenantId: string, dto: { name: string; sortOrder?: number }) {
    const db = await this.getGatewayClient(tenantId);
    return db.menuCategory.create({
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
        tenantId: parseInt(tenantId) || 1,
      },
    });
  }

  async updateCategory(tenantId: string, id: number, dto: { name?: string; sortOrder?: number; isActive?: boolean }) {
    const db = await this.getGatewayClient(tenantId);
    return db.menuCategory.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCategory(tenantId: string, id: number) {
    const db = await this.getGatewayClient(tenantId);
    // Unassign recipes first
    await db.recipe.updateMany({
      where: { categoryId: id, tenantId: parseInt(tenantId) || 1 },
      data: { categoryId: null },
    });
    return db.menuCategory.delete({ where: { id } });
  }

  // --- Menu items (recipes with category) ---
  async findAllMenuItems(tenantId: string) {
    const db = await this.getGatewayClient(tenantId);
    return db.recipe.findMany({
      where: { tenantId: parseInt(tenantId) || 1 },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async updateMenuItem(tenantId: string, id: number, dto: { categoryId?: number | null; salePrice?: number; imageUrl?: string | null; isActive?: boolean }) {
    const db = await this.getGatewayClient(tenantId);
    return db.recipe.update({
      where: { id },
      data: dto,
    });
  }

  async createMenuItem(tenantId: string, dto: { name: string; salePrice?: number; categoryId?: number; imageUrl?: string }) {
    const db = await this.getGatewayClient(tenantId);
    return db.recipe.create({
      data: {
        name: dto.name,
        salePrice: dto.salePrice || 0,
        categoryId: dto.categoryId || null,
        imageUrl: dto.imageUrl || null,
        tenantId: parseInt(tenantId) || 1,
      },
    });
  }
}
