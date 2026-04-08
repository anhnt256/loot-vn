import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import {
  CreateEventDto,
  UpdateEventDto,
  CreatePromotionDto,
  UpdatePromotionDto,
} from './dto';

@Injectable()
export class EventPromotionService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  // ─── Event CRUD ───

  async createEvent(tenantId: string, dto: CreateEventDto) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const event = await db.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type as any,
        status: 'DRAFT',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        budget: dto.budget,
        targetRules: dto.targetRules?.length
          ? {
              createMany: {
                data: dto.targetRules.map((r) => ({
                  type: r.type as any,
                  operator: r.operator,
                  value: r.value,
                })),
              },
            }
          : undefined,
      },
      include: { targetRules: true },
    });

    return event;
  }

  async getEvents(tenantId: string, status?: string) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    return db.event.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        targetRules: true,
        promotions: {
          include: {
            conditions: true,
            rewardBundles: { include: { items: true } },
            couponBatches: true,
          },
        },
        _count: { select: { participants: true, analytics: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEventById(tenantId: string, eventId: string) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        targetRules: true,
        promotions: {
          include: {
            conditions: true,
            rewardBundles: { include: { items: true } },
            couponBatches: { include: { _count: { select: { codes: true } } } },
          },
        },
        participants: { take: 50, orderBy: { registeredAt: 'desc' } },
        analytics: { orderBy: { snapshotDate: 'desc' }, take: 1 },
      },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async updateEvent(tenantId: string, eventId: string, dto: UpdateEventDto) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    return db.event.update({
      where: { id: eventId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type !== undefined && { type: dto.type as any }),
        ...(dto.status !== undefined && { status: dto.status as any }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.budget !== undefined && { budget: dto.budget }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { targetRules: true },
    });
  }

  async updateTargetRules(
    tenantId: string,
    eventId: string,
    rules: { type: string; operator: string; value: string }[],
  ) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    await db.eventTargetRule.deleteMany({ where: { eventId } });

    if (rules.length) {
      await db.eventTargetRule.createMany({
        data: rules.map((r) => ({
          eventId,
          type: r.type as any,
          operator: r.operator,
          value: r.value,
        })),
      });
    }

    return db.eventTargetRule.findMany({ where: { eventId } });
  }

  // ─── Promotion CRUD ───

  async createPromotion(tenantId: string, dto: CreatePromotionDto) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const event = await db.event.findUnique({ where: { id: dto.eventId } });
    if (!event) throw new BadRequestException('Event not found');

    return db.eventPromotion.create({
      data: {
        eventId: dto.eventId,
        name: dto.name,
        description: dto.description,
        priority: dto.priority ?? 1,
        conditions: dto.conditions?.length
          ? {
              createMany: {
                data: dto.conditions.map((c) => ({
                  triggerAction: c.triggerAction as any,
                  operator: c.operator,
                  value: c.value,
                })),
              },
            }
          : undefined,
        rewardBundles: dto.rewardBundles?.length
          ? {
              create: dto.rewardBundles.map((b) => ({
                name: b.name,
                items: {
                  createMany: {
                    data: b.items.map((item) => ({
                      rewardType: item.rewardType as any,
                      value: item.value,
                      walletType: item.walletType,
                      maxValue: item.maxValue,
                      metadata: item.metadata,
                    })),
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        conditions: true,
        rewardBundles: { include: { items: true } },
      },
    });
  }

  async updatePromotion(tenantId: string, promotionId: number, dto: UpdatePromotionDto) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    return db.eventPromotion.update({
      where: { id: promotionId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
      },
      include: {
        conditions: true,
        rewardBundles: { include: { items: true } },
      },
    });
  }

  async deletePromotion(tenantId: string, promotionId: number) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    // Cascade delete conditions, reward bundles/items, coupon batches/codes
    await db.$transaction(async (tx) => {
      // Delete reward items via bundles
      const bundles = await tx.promotionRewardBundle.findMany({
        where: { promotionId },
        select: { id: true },
      });
      if (bundles.length) {
        await tx.promotionRewardItem.deleteMany({
          where: { bundleId: { in: bundles.map((b) => b.id) } },
        });
      }

      // Delete coupon codes via batches
      const batches = await tx.couponBatch.findMany({
        where: { promotionId },
        select: { id: true },
      });
      if (batches.length) {
        await tx.couponCode.deleteMany({
          where: { batchId: { in: batches.map((b) => b.id) } },
        });
      }

      await tx.promotionRewardBundle.deleteMany({ where: { promotionId } });
      await tx.promotionCondition.deleteMany({ where: { promotionId } });
      await tx.couponBatch.deleteMany({ where: { promotionId } });
      await tx.eventPromotion.delete({ where: { id: promotionId } });
    });

    return { success: true };
  }
}
