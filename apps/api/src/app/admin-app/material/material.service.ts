import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService
  ) {}

  private async findTenant(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');
    return tenant;
  }

  private async getGatewayClient(tenantId: string) {
    const tenant = await this.findTenant(tenantId);
    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');
    return await this.tenantPrisma.getClient(dbUrl);
  }

  async findAll(tenantId: string) {
    try {
      const db = await this.getGatewayClient(tenantId);
      // Prisma query with tenant filtering (if DB is shared)
      // or just list all if DB is isolated per tenant.
      // We'll filter by tenantId in the model just to be safe as per AC.
      return await db.material.findMany({
        where: { tenantId: parseInt(tenantId) || 1 },
        orderBy: { sku: 'asc' },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Không lấy được danh sách nguyên liệu');
    }
  }

  async findOne(tenantId: string, id: number) {
    try {
      const db = await this.getGatewayClient(tenantId);
      const material = await db.material.findFirst({
        where: { id, tenantId: parseInt(tenantId) || 1 },
      });
      if (!material) throw new NotFoundException('Không tìm thấy nguyên liệu');
      return material;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Lỗi khi tìm nguyên liệu');
    }
  }

  async create(tenantId: string, dto: CreateMaterialDto) {
    try {
      const db = await this.getGatewayClient(tenantId);
      
      // SKU uniqueness check within tenant
      if (dto.sku) {
        const existing = await db.material.findFirst({
          where: { sku: dto.sku, tenantId: parseInt(tenantId) || 1 },
        });
        if (existing) throw new BadRequestException(`SKU ${dto.sku} đã tồn tại trong hệ thống`);
      }

      return await db.material.create({
        data: {
          ...dto,
          tenantId: parseInt(tenantId) || 1,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Không thể thêm nguyên liệu mới');
    }
  }

  async update(tenantId: string, id: number, dto: UpdateMaterialDto) {
    try {
      const db = await this.getGatewayClient(tenantId);
      
      const existing = await db.material.findFirst({
        where: { id, tenantId: parseInt(tenantId) || 1 },
      });
      if (!existing) throw new NotFoundException('Nguyên liệu không tồn tại');

      if (dto.sku && dto.sku !== existing.sku) {
        const duplicateSku = await db.material.findFirst({
          where: { sku: dto.sku, tenantId: parseInt(tenantId) || 1 },
        });
        if (duplicateSku) throw new BadRequestException(`SKU ${dto.sku} đã bị trùng`);
      }

      return await db.material.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Lỗi cập nhật nguyên liệu');
    }
  }

  async remove(tenantId: string, id: number) {
    try {
      const db = await this.getGatewayClient(tenantId);
      return await db.material.update({
        where: { id, tenantId: parseInt(tenantId) || 1 },
        data: { isActive: false },
      });
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa (deactivate) nguyên liệu');
    }
  }

  // --- Recipe Management ---
  async findAllRecipes(tenantId: string) {
    const db = await this.getGatewayClient(tenantId);
    return await db.recipe.findMany({
      where: { tenantId: parseInt(tenantId) || 1 },
      include: {
        versions: {
          orderBy: { effectiveFrom: 'desc' },
          include: { items: { include: { material: true } } }
        }
      }
    });
  }

  async createRecipe(tenantId: string, dto: any) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    return await db.$transaction(async (tx) => {
      // 1. Create Recipe object
      const recipe = await tx.recipe.create({
        data: {
          name: dto.name,
          salePrice: dto.salePrice || 0,
          tenantId: tenantIdInt,
        }
      });

      // 2. Create the first version
      const version = await tx.recipeVersion.create({
        data: {
          recipeId: recipe.id,
          versionName: 'V1',
          isActive: true,
          tenantId: tenantIdInt,
        }
      });

      // 3. Create items for this version
      for (const item of dto.items) {
        await tx.recipeItem.create({
          data: {
            recipeVersionId: version.id,
            materialId: item.materialId,
            quantity: item.quantity,
            unit: item.unit,
            tenantId: tenantIdInt,
          }
        });
      }

      return recipe;
    });
  }

  async updateRecipe(tenantId: string, recipeId: number, dto: any) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    return await db.$transaction(async (tx) => {
      // 1. Deactivate old versions
      await tx.recipeVersion.updateMany({
        where: { recipeId, tenantId: tenantIdInt },
        data: { isActive: false },
      });

      // 2. Count versions for naming
      const count = await tx.recipeVersion.count({ where: { recipeId } });

      // 3. Create new version
      const version = await tx.recipeVersion.create({
        data: {
          recipeId,
          versionName: `V${count + 1}`,
          isActive: true,
          tenantId: tenantIdInt,
        },
      });

      // 4. Create items
      for (const item of dto.items) {
        await tx.recipeItem.create({
          data: {
            recipeVersionId: version.id,
            materialId: item.materialId,
            quantity: item.quantity,
            unit: item.unit || '',
            tenantId: tenantIdInt,
          },
        });
      }

      return version;
    });
  }

  // --- Material Unit Conversions ---
  async addConversion(tenantId: string, materialId: number, dto: any) {
    const db = await this.getGatewayClient(tenantId);
    return await db.materialUnitConversion.create({
      data: {
        ...dto,
        materialId,
        tenantId: parseInt(tenantId) || 1,
      }
    });
  }

  async getConversions(tenantId: string, materialId: number) {
    const db = await this.getGatewayClient(tenantId);
    return await db.materialUnitConversion.findMany({
      where: { materialId, tenantId: parseInt(tenantId) || 1 },
    });
  }

  async adjustStock(tenantId: string, dto: { materialId: number; type: 'RECEIPT' | 'ISSUE'; quantity: number; reason?: string }) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    const material = await db.material.findFirst({
      where: { id: dto.materialId, tenantId: tenantIdInt },
    });
    if (!material) throw new NotFoundException('Nguyên liệu không tồn tại');

    if (dto.quantity <= 0) throw new BadRequestException('Số lượng phải lớn hơn 0');

    const isReceipt = dto.type === 'RECEIPT';
    const quantityChange = isReceipt ? dto.quantity : -dto.quantity;

    return await db.$transaction(async (tx) => {
      const updated = await tx.material.update({
        where: { id: dto.materialId },
        data: {
          quantityInStock: isReceipt
            ? { increment: dto.quantity }
            : { decrement: dto.quantity },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          materialId: dto.materialId,
          type: dto.type,
          quantityChange,
          reason: dto.reason || (isReceipt ? 'Nhập kho' : 'Xuất kho'),
          tenantId: tenantIdInt,
        },
      });

      return updated;
    });
  }

  async findAllTransactions(tenantId: string) {
    const db = await this.getGatewayClient(tenantId);
    return await db.inventoryTransaction.findMany({
      where: { tenantId: parseInt(tenantId) || 1 },
      include: { material: { select: { name: true, baseUnit: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  // --- Profit Analysis ---
  async getProfitAnalysis(tenantId: string) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    const recipes = await db.recipe.findMany({
      where: { isActive: true, tenantId: tenantIdInt },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
          include: {
            items: {
               include: {
                  material: { select: { costPrice: true, name: true } }
               }
            }
          }
        }
      }
    });

    return (recipes as any[]).map(recipe => {
      const activeVersion = recipe.versions?.[0];

      let totalCost = 0;
      if (activeVersion) {
        totalCost = activeVersion.items.reduce((sum: number, item: any) => {
          const cost = Number(item.quantity) * Number(item.material?.costPrice || 0);
          return sum + cost;
        }, 0);
      }

      const salePrice = Number(recipe.salePrice) || 0;
      const profit = salePrice - totalCost;
      const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

      return {
        id: recipe.id,
        recipeName: recipe.name,
        salePrice,
        costPrice: totalCost,
        profit,
        margin: margin.toFixed(2) + "%",
        items: activeVersion?.items?.length || 0
      };
    });
  }
}
