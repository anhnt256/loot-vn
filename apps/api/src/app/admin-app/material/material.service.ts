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

  async adjustStock(tenantId: string, dto: { materialId: number; type: 'RECEIPT' | 'ISSUE'; quantity: number; reason?: string }, staffId?: number) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    // Phải có ca đang hoạt động mới được Nhập/Xuất kho
    const activeShift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: tenantIdInt, isActive: true },
    });
    if (!activeShift) {
      throw new BadRequestException('Chưa có ca nào đang hoạt động. Cần nhận ca trước khi Nhập/Xuất kho.');
    }
    // Chỉ người đang nhận ca mới được phép Nhập/Xuất kho
    if (activeShift.staffId !== staffId) {
      throw new BadRequestException(
        `Chỉ "${activeShift.staffName}" (người đang nhận ca) mới được phép Nhập/Xuất kho.`,
      );
    }

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
          staffId: staffId ?? activeShift.staffId,
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

  /**
   * Danh sách ca làm việc kèm thống kê biến động kho trong ca
   */
  async findShiftAuditList(tenantId: string, page = 1, limit = 20, from?: string, to?: string, staffName?: string) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;
    const skip = (page - 1) * limit;

    const where: any = { tenantId: tenantIdInt };
    if (from || to) {
      where.startedAt = {};
      if (from) where.startedAt.gte = new Date(from);
      if (to) where.startedAt.lte = new Date(to);
    }
    if (staffName) {
      where.staffName = { contains: staffName };
    }

    const [shifts, total] = await Promise.all([
      ((db as any).staffShift as any).findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      ((db as any).staffShift as any).count({ where }),
    ]);

    // Thống kê cho từng ca
    const result = await Promise.all(
      (shifts as any[]).map(async (shift: any) => {
        const timeFilter: any = { gte: new Date(shift.startedAt) };
        if (shift.endedAt) timeFilter.lte = new Date(shift.endedAt);
        const orderWhere = { tenantId: tenantIdInt, createdAt: timeFilter };

        const [txCounts, totalOrders, completedAgg, cancelledCount] = await Promise.all([
          db.inventoryTransaction.groupBy({
            by: ['type'],
            where: { tenantId: tenantIdInt, createdAt: timeFilter },
            _count: { id: true },
          }),
          (db.foodOrder as any).count({ where: orderWhere }),
          (db.foodOrder as any).aggregate({
            where: { ...orderWhere, status: 'HOAN_THANH' },
            _sum: { totalAmount: true },
            _count: { id: true },
          }),
          (db.foodOrder as any).count({ where: { ...orderWhere, status: 'HUY' } }),
        ]);

        const byType: Record<string, number> = {};
        for (const g of txCounts as any[]) {
          byType[g.type] = g._count.id;
        }

        return {
          id: shift.id,
          staffName: shift.staffName,
          staffId: shift.staffId,
          startedAt: shift.startedAt,
          endedAt: shift.endedAt,
          isActive: shift.isActive,
          totalOrders: Number(totalOrders),
          completedOrders: Number(completedAgg._count?.id ?? 0),
          cancelledOrders: Number(cancelledCount),
          totalRevenue: Number(completedAgg._sum?.totalAmount ?? 0),
          receiptCount: byType['RECEIPT'] || 0,
          saleCount: byType['SALE'] || 0,
        };
      }),
    );

    return { data: result, total, page, limit };
  }

  /**
   * Chi tiết Nhập kho trong 1 ca — kèm số lượng trước/sau khi nhập
   */
  async findShiftReceiptDetail(tenantId: string, shiftId: number) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    const shift = await ((db as any).staffShift as any).findFirst({
      where: { id: shiftId, tenantId: tenantIdInt },
    });
    if (!shift) throw new NotFoundException('Không tìm thấy ca làm việc');

    const timeFilter: any = { gte: new Date(shift.startedAt) };
    if (shift.endedAt) timeFilter.lte = new Date(shift.endedAt);

    const receipts = await db.inventoryTransaction.findMany({
      where: {
        tenantId: tenantIdInt,
        createdAt: timeFilter,
        type: 'RECEIPT',
      },
      include: { material: { select: { name: true, baseUnit: true, quantityInStock: true } } },
      orderBy: { createdAt: 'asc' },
    });

    // Tính số lượng trước/sau cho mỗi giao dịch nhập kho
    // Lấy tổng thay đổi SAU mỗi giao dịch nhập cho từng material để tính ngược
    const materialIds = [...new Set(receipts.map((r: any) => r.materialId))];
    const allSubsequentByMaterial: Record<number, number> = {};

    for (const matId of materialIds) {
      // Tất cả transactions cho material này SAU ca (hoặc SAU shift.endedAt)
      const afterShift = await db.inventoryTransaction.findMany({
        where: {
          tenantId: tenantIdInt,
          materialId: matId as number,
          createdAt: shift.endedAt ? { gt: new Date(shift.endedAt) } : { gt: new Date() },
        },
        select: { quantityChange: true },
      });
      const totalAfter = afterShift.reduce((s: number, t: any) => s + Number(t.quantityChange), 0);
      allSubsequentByMaterial[matId as number] = totalAfter;
    }

    // Tính: stockAfterAll = currentStock. stockAtEndOfShift = currentStock - totalAfterShift
    // Duyệt ngược danh sách receipts trong ca để tính before/after
    const materialTxInShift: Record<number, any[]> = {};
    for (const matId of materialIds) {
      const allInShift = await db.inventoryTransaction.findMany({
        where: {
          tenantId: tenantIdInt,
          materialId: matId as number,
          createdAt: timeFilter,
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, quantityChange: true },
      });
      materialTxInShift[matId as number] = allInShift;
    }

    const result = receipts.map((r: any) => {
      const currentStock = Number(r.material?.quantityInStock ?? 0);
      const totalAfterShift = Number(allSubsequentByMaterial[r.materialId] ?? 0);
      const stockAtEndOfShift = currentStock - totalAfterShift;

      // Tính tổng thay đổi SAU giao dịch này trong ca
      const txsInShift = materialTxInShift[r.materialId] || [];
      let sumAfterThis = 0;
      for (const tx of txsInShift) {
        if (tx.id === r.id) break;
        sumAfterThis += Number(tx.quantityChange);
      }
      const quantityAfter = stockAtEndOfShift - sumAfterThis;
      const quantityChange = Number(r.quantityChange);
      const quantityBefore = quantityAfter - quantityChange;

      return {
        id: r.id,
        materialId: r.materialId,
        materialName: r.material?.name,
        baseUnit: r.material?.baseUnit,
        quantityChange,
        quantityBefore: Math.round(quantityBefore * 100) / 100,
        quantityAfter: Math.round(quantityAfter * 100) / 100,
        reason: r.reason,
        staffId: r.staffId,
        createdAt: r.createdAt,
      };
    });

    return { shift: { id: shift.id, staffName: shift.staffName, startedAt: shift.startedAt, endedAt: shift.endedAt }, data: result };
  }

  /**
   * Chi tiết Xuất kho (SALE) trong 1 ca — kèm thông tin đơn hàng
   */
  async findShiftSaleDetail(tenantId: string, shiftId: number) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    const shift = await ((db as any).staffShift as any).findFirst({
      where: { id: shiftId, tenantId: tenantIdInt },
    });
    if (!shift) throw new NotFoundException('Không tìm thấy ca làm việc');

    const timeFilter: any = { gte: new Date(shift.startedAt) };
    if (shift.endedAt) timeFilter.lte = new Date(shift.endedAt);

    const sales = await db.inventoryTransaction.findMany({
      where: {
        tenantId: tenantIdInt,
        createdAt: timeFilter,
        type: 'SALE',
      },
      include: { material: { select: { name: true, baseUnit: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Nhóm theo referenceId (orderId) để admin đối chiếu
    const orderIds = [...new Set(sales.filter((s: any) => s.referenceId).map((s: any) => Number(s.referenceId)))];
    const orders: Record<number, any> = {};
    if (orderIds.length > 0) {
      const orderList = await (db.foodOrder as any).findMany({
        where: { id: { in: orderIds }, tenantId: tenantIdInt },
        include: { details: true },
      });
      for (const o of orderList) {
        orders[o.id] = o;
      }
    }

    return {
      shift: { id: shift.id, staffName: shift.staffName, startedAt: shift.startedAt, endedAt: shift.endedAt },
      data: sales.map((s: any) => ({
        id: s.id,
        materialId: s.materialId,
        materialName: s.material?.name,
        baseUnit: s.material?.baseUnit,
        quantityChange: Number(s.quantityChange),
        reason: s.reason,
        referenceId: s.referenceId,
        createdAt: s.createdAt,
      })),
      orders,
    };
  }

  /**
   * Danh sách đơn hàng trong 1 ca, lọc theo status
   */
  async findShiftOrders(tenantId: string, shiftId: number, status?: string) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    const shift = await ((db as any).staffShift as any).findFirst({
      where: { id: shiftId, tenantId: tenantIdInt },
    });
    if (!shift) throw new NotFoundException('Không tìm thấy ca làm việc');

    const timeFilter: any = { gte: new Date(shift.startedAt) };
    if (shift.endedAt) timeFilter.lte = new Date(shift.endedAt);

    const where: any = { tenantId: tenantIdInt, createdAt: timeFilter };
    if (status === 'PENDING') {
      // Đang xử lý = chưa hoàn thành, chưa huỷ
      where.status = { notIn: ['HOAN_THANH', 'HUY'] };
    } else if (status) {
      where.status = status;
    }

    const orders = await (db.foodOrder as any).findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { details: true, statusHistory: { orderBy: { changedAt: 'asc' } } },
    });

    return {
      shift: { id: shift.id, staffName: shift.staffName, startedAt: shift.startedAt, endedAt: shift.endedAt },
      data: orders,
    };
  }

  /**
   * Chi tiết 1 đơn hàng để đối chiếu
   */
  async findOrderDetail(tenantId: string, orderId: number) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    const order = await (db.foodOrder as any).findFirst({
      where: { id: orderId, tenantId: tenantIdInt },
      include: {
        details: true,
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
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
