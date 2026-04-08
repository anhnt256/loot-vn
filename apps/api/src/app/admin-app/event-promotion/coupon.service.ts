import { Injectable, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { CreateCouponBatchDto } from './dto';

@Injectable()
export class CouponService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  private generateCode(length = 8): string {
    return randomBytes(length)
      .toString('base64url')
      .slice(0, length)
      .toUpperCase();
  }

  async createBatch(tenantId: string, dto: CreateCouponBatchDto) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const promotion = await db.eventPromotion.findUnique({
      where: { id: dto.promotionId },
    });
    if (!promotion) throw new BadRequestException('Promotion not found');

    if (dto.totalCodes > 10000) {
      throw new BadRequestException('Max 10,000 codes per batch');
    }

    // Create batch
    const batch = await db.couponBatch.create({
      data: {
        promotionId: dto.promotionId,
        name: dto.name,
        discountType: dto.discountType as any,
        discountValue: dto.discountValue,
        maxDiscountValue: dto.maxDiscountValue,
        totalCodes: dto.totalCodes,
        validDays: dto.validDays,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
        usageFrequency: dto.usageFrequency as any,
        maxUsagePerUser: dto.maxUsagePerUser ?? 1,
      },
    });

    // Generate codes in chunks to avoid memory issues
    const CHUNK_SIZE = 500;
    const codes: { batchId: number; code: string; expiresAt: Date | null }[] = [];
    const usedCodes = new Set<string>();

    for (let i = 0; i < dto.totalCodes; i++) {
      let code: string;
      let attempts = 0;
      do {
        code = this.generateCode();
        attempts++;
        if (attempts > 10) {
          code = this.generateCode(12); // longer code to avoid collision
        }
      } while (usedCodes.has(code));

      usedCodes.add(code);

      const expiresAt = dto.validDays
        ? new Date(Date.now() + dto.validDays * 24 * 60 * 60 * 1000)
        : dto.validTo
          ? new Date(dto.validTo)
          : null;

      codes.push({ batchId: batch.id, code, expiresAt });
    }

    // Insert in chunks
    for (let i = 0; i < codes.length; i += CHUNK_SIZE) {
      const chunk = codes.slice(i, i + CHUNK_SIZE);
      await db.couponCode.createMany({ data: chunk, skipDuplicates: true });
    }

    const createdCount = await db.couponCode.count({
      where: { batchId: batch.id },
    });

    return { ...batch, codesCreated: createdCount };
  }

  async getCouponsByBatch(tenantId: string, batchId: number, page = 1, pageSize = 50) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const [codes, total] = await Promise.all([
      db.couponCode.findMany({
        where: { batchId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.couponCode.count({ where: { batchId } }),
    ]);

    return { codes, total, page, pageSize };
  }

  async validateAndUseCoupon(tenantId: string, code: string, userId: number) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    return db.$transaction(async (tx) => {
      const coupon = await tx.couponCode.findUnique({
        where: { code },
        include: { batch: { include: { promotion: { include: { event: true } } } } },
      });

      if (!coupon) throw new BadRequestException('Mã không tồn tại');
      if (coupon.isUsed) throw new BadRequestException('Mã đã được sử dụng');
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new BadRequestException('Mã đã hết hạn');
      }

      const batch = coupon.batch;
      const event = batch.promotion.event;

      // Check event is active
      if (event.status !== 'ACTIVE' || !event.isActive) {
        throw new BadRequestException('Sự kiện không còn hoạt động');
      }

      // Check usage frequency
      await this.checkUsageFrequency(tx, batch.id, userId, batch.usageFrequency, batch.maxUsagePerUser);

      // Mark coupon as used
      const updated = await tx.couponCode.update({
        where: { id: coupon.id },
        data: { isUsed: true, usedBy: userId, usedAt: new Date() },
      });

      return {
        coupon: updated,
        discount: {
          type: batch.discountType,
          value: batch.discountValue,
          maxValue: batch.maxDiscountValue,
        },
      };
    });
  }

  private async checkUsageFrequency(
    tx: any,
    batchId: number,
    userId: number,
    frequency: string,
    maxPerUser: number,
  ) {
    let since: Date | null = null;

    switch (frequency) {
      case 'ONE_TIME': {
        const used = await tx.couponCode.count({
          where: { batch: { id: batchId }, usedBy: userId, isUsed: true },
        });
        if (used >= maxPerUser) {
          throw new BadRequestException('Bạn đã sử dụng hết lượt cho mã này');
        }
        return;
      }
      case 'PER_WEEK': {
        const now = new Date();
        since = new Date(now);
        since.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        since.setHours(0, 0, 0, 0);
        break;
      }
      case 'PER_MONTH': {
        const now = new Date();
        since = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      }
      case 'PER_EVENT':
        return; // No frequency limit during event
    }

    if (since) {
      const usedInPeriod = await tx.couponCode.count({
        where: {
          batch: { id: batchId },
          usedBy: userId,
          isUsed: true,
          usedAt: { gte: since },
        },
      });
      if (usedInPeriod >= maxPerUser) {
        throw new BadRequestException('Bạn đã đạt giới hạn sử dụng trong kỳ này');
      }
    }
  }
}
