import { Injectable, BadRequestException } from '@nestjs/common';
import { redisService } from '../../lib/redis-service';
import { TenantGatewayService } from '../../database/tenant-gateway.service';

const stockKey = (tenantId: string, materialId: number) =>
  `${tenantId}:stock:${materialId}`;

/** Các trạng thái đã reserve kho trong Redis */
export const STOCK_RESERVED_STATUSES = ['CHAP_NHAN', 'THU_TIEN', 'PHUC_VU'];

@Injectable()
export class StockService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  /**
   * Đồng bộ tồn kho từ DB sang Redis cho tất cả materials (gọi khi cần reset)
   */
  async syncStock(tenantId: string): Promise<number> {
    const db = await this.tenantGateway.getGatewayClient(tenantId);
    const parsedTenantId = parseInt(tenantId) || 1;

    const materials = await (db.material as any).findMany({
      where: { tenantId: parsedTenantId, isActive: true },
      select: { id: true, quantityInStock: true },
    });

    for (const mat of materials) {
      await redisService.set(
        stockKey(tenantId, mat.id),
        String(Number(mat.quantityInStock)),
      );
    }
    return materials.length;
  }

  /**
   * Lấy stock từ Redis, lazy init từ DB nếu chưa có
   */
  private async getOrInitStock(tenantId: string, materialId: number): Promise<number> {
    const key = stockKey(tenantId, materialId);
    const val = await redisService.get(key);
    if (val !== null) return parseFloat(val);

    // Lazy init from DB
    const db = await this.tenantGateway.getGatewayClient(tenantId);
    const material = await (db.material as any).findUnique({
      where: { id: materialId },
      select: { quantityInStock: true },
    });
    const stock = material ? Number(material.quantityInStock) : 0;
    await redisService.set(key, String(stock));
    return stock;
  }

  /**
   * Gộp nguyên liệu từ order details theo materialId
   */
  private aggregateIngredients(
    orderDetails: { recipeSnapshot: string; quantity: number }[],
  ): Map<number, { amount: number; name: string }> {
    const map = new Map<number, { amount: number; name: string }>();

    for (const detail of orderDetails) {
      const ingredients: any[] = JSON.parse(detail.recipeSnapshot || '[]');
      for (const ing of ingredients) {
        const materialId: number = ing.materialId;
        const amount = Number(ing.quantity) * detail.quantity;
        const existing = map.get(materialId);
        if (existing) {
          existing.amount += amount;
        } else {
          map.set(materialId, {
            amount,
            name: ing.material?.name || `nguyên liệu #${materialId}`,
          });
        }
      }
    }
    return map;
  }

  /**
   * Trừ kho Redis khi chấp nhận đơn (CHAP_NHAN).
   * Check tồn kho trước, rollback nếu không đủ.
   */
  async reserveStock(
    tenantId: string,
    orderDetails: { recipeSnapshot: string; quantity: number }[],
  ): Promise<void> {
    const ingredients = this.aggregateIngredients(orderDetails);
    const deducted: { materialId: number; amount: number }[] = [];

    try {
      for (const [materialId, { amount, name }] of ingredients) {
        const currentStock = await this.getOrInitStock(tenantId, materialId);
        if (currentStock < amount) {
          throw new BadRequestException(
            `Nguyên liệu "${name}" không đủ tồn kho (cần ${amount}, còn ${currentStock})`,
          );
        }
        await redisService.incrByFloat(stockKey(tenantId, materialId), -amount);
        deducted.push({ materialId, amount });
      }
    } catch (err) {
      // Rollback các nguyên liệu đã trừ
      for (const d of deducted) {
        await redisService
          .incrByFloat(stockKey(tenantId, d.materialId), d.amount)
          .catch(() => {});
      }
      throw err;
    }
  }

  /**
   * Hoàn trả kho Redis khi huỷ đơn (HUY) — chỉ gọi khi đã reserve trước đó
   */
  async releaseStock(
    tenantId: string,
    orderDetails: { recipeSnapshot: string; quantity: number }[],
  ): Promise<void> {
    const ingredients = this.aggregateIngredients(orderDetails);
    for (const [materialId, { amount }] of ingredients) {
      await redisService.incrByFloat(stockKey(tenantId, materialId), amount);
    }
  }

  /**
   * Trừ kho DB khi hoàn thành đơn (HOAN_THANH).
   * Chạy trong Prisma transaction đã có sẵn từ caller.
   */
  async commitStockInTx(
    tx: any,
    tenantIdInt: number,
    orderId: number,
    orderDetails: { recipeId: number; recipeName: string; quantity: number; recipeSnapshot: string }[],
  ): Promise<void> {
    for (const detail of orderDetails) {
      const ingredients: any[] = JSON.parse(detail.recipeSnapshot || '[]');
      for (const ing of ingredients) {
        const deduction = Number(ing.quantity) * detail.quantity;

        await tx.material.update({
          where: { id: ing.materialId },
          data: { quantityInStock: { decrement: deduction } },
        });

        await tx.inventoryTransaction.create({
          data: {
            materialId: ing.materialId,
            type: 'SALE',
            quantityChange: -deduction,
            reason: `Bán: ${detail.recipeName}`,
            referenceId: String(orderId),
            tenantId: tenantIdInt,
          },
        });
      }
    }
  }
}
