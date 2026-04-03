import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { Prisma } from '@gateway-workspace/database';

@Injectable()
export class InventoryEngineService {
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
    return await this.tenantPrisma.getClient(dbUrl);
  }

  /**
   * Trừ kho tự động khi hoàn thành đơn hàng.
   * Chạy trong Prisma.$transaction để đảm bảo tính toàn vẹn dữ liệu.
   */
  async processOrderCompletion(tenantId: string, orderId: string, items: { recipeId: number, quantity: number }[]) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    return await db.$transaction(async (tx) => {
      const results = [];

      for (const item of items) {
        // 1. Tìm công thức (Recipe) đang hoạt động
        const recipe = await tx.recipe.findFirst({
          where: { id: item.recipeId, isActive: true, tenantId: tenantIdInt },
          include: {
            versions: {
              where: {
                isActive: true,
                effectiveFrom: { lte: new Date() }
              },
              orderBy: { effectiveFrom: 'desc' },
              take: 1,
              include: { items: true }
            }
          }
        });

        if (!recipe || recipe.versions.length === 0) {
          console.warn(`[Inventory] No active recipe found for recipeId: ${item.recipeId}`);
          continue;
        }

        const activeVersion = recipe.versions[0];

        // 2. Duyệt qua từng nguyên liệu trong công thức
        for (const recipeItem of activeVersion.items) {
          // Tính toán tổng lượng trừ (số lượng trong công thức * số lượng đơn hàng)
          const totalDeduction = new Prisma.Decimal(recipeItem.quantity).times(item.quantity);

          // 3. Cập nhật tồn kho Material
          const updatedMaterial = await tx.material.update({
            where: { id: recipeItem.materialId },
            data: {
              quantityInStock: {
                decrement: totalDeduction
              }
            }
          });

          // 4. Ghi nhận nhật ký biến động kho (Audit Log)
          await tx.inventoryTransaction.create({
            data: {
              materialId: recipeItem.materialId,
              type: 'SALE',
              quantityChange: totalDeduction.negated(),
              reason: `Bán sản phẩm: ${recipe.name}`,
              referenceId: orderId,
              tenantId: tenantIdInt
            }
          });

          results.push({
            materialId: recipeItem.materialId,
            deducted: totalDeduction,
            newStock: updatedMaterial.quantityInStock
          });
        }
      }

      return results;
    });
  }

  /**
    * Nhập kho (Inventory Receipt)
    */
  async processReceipt(tenantId: string, materialId: number, quantity: number, referenceId: string, reason?: string) {
    const db = await this.getGatewayClient(tenantId);
    const tenantIdInt = parseInt(tenantId) || 1;

    return await db.$transaction(async (tx) => {
      const updated = await tx.material.update({
        where: { id: materialId },
        data: {
          quantityInStock: { increment: quantity }
        }
      });

      await tx.inventoryTransaction.create({
        data: {
          materialId,
          type: 'RECEIPT',
          quantityChange: new Prisma.Decimal(quantity),
          referenceId,
          reason: reason || 'Nhập kho bổ sung',
          tenantId: tenantIdInt
        }
      });

      return updated;
    });
  }
}
