import { Injectable } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';

@Injectable()
export class EventAnalyticsService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async generateSnapshot(tenantId: string, eventId: string) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const [participantStats, couponStats, rewardStats] = await Promise.all([
      db.eventParticipant.groupBy({
        by: ['status'],
        where: { eventId },
        _count: true,
      }),
      this.getCouponStats(db, eventId),
      this.getRewardStats(db, eventId),
    ]);

    const totalParticipants = participantStats.reduce((sum, s) => sum + s._count, 0);
    const totalCompleted = participantStats.find((s) => s.status === 'COMPLETED')?._count ?? 0;

    const snapshot = await db.eventAnalytics.create({
      data: {
        eventId,
        totalEligible: 0, // Calculated on-demand via target rules
        totalParticipants,
        totalRewardsClaimed: Number(rewardStats.totalClaimed),
        totalCouponsIssued: Number(couponStats.totalIssued),
        totalCouponsUsed: Number(couponStats.totalUsed),
        totalRevenue: rewardStats.totalRevenue,
        totalRewardCost: rewardStats.totalCost,
        conversionRate: totalParticipants > 0 ? totalCompleted / totalParticipants : 0,
      },
    });

    return snapshot;
  }

  async getAnalytics(tenantId: string, eventId: string) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const [latestSnapshot, promotionBreakdown] = await Promise.all([
      db.eventAnalytics.findFirst({
        where: { eventId },
        orderBy: { snapshotDate: 'desc' },
      }),
      this.getPromotionBreakdown(db, eventId),
    ]);

    return {
      snapshot: latestSnapshot,
      promotionBreakdown,
    };
  }

  async getAnalyticsHistory(tenantId: string, eventId: string, limit = 30) {
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    return db.eventAnalytics.findMany({
      where: { eventId },
      orderBy: { snapshotDate: 'desc' },
      take: limit,
    });
  }

  private async getCouponStats(db: any, eventId: string) {
    const result = await db.couponCode.aggregate({
      where: {
        batch: { promotion: { eventId } },
      },
      _count: true,
    });

    const usedResult = await db.couponCode.aggregate({
      where: {
        batch: { promotion: { eventId } },
        isUsed: true,
      },
      _count: true,
    });

    return {
      totalIssued: result._count ?? 0,
      totalUsed: usedResult._count ?? 0,
    };
  }

  private async getRewardStats(db: any, eventId: string) {
    // Count claimed rewards from participants
    const participants = await db.eventParticipant.aggregate({
      where: { eventId, status: 'COMPLETED' },
      _count: true,
      _sum: { totalSpent: true },
    });

    return {
      totalClaimed: participants._count ?? 0,
      totalRevenue: participants._sum?.totalSpent ?? 0,
      totalCost: 0, // Calculated from actual reward distribution logs
    };
  }

  private async getPromotionBreakdown(db: any, eventId: string) {
    const promotions = await db.eventPromotion.findMany({
      where: { eventId },
      include: {
        couponBatches: {
          include: {
            _count: { select: { codes: true } },
          },
        },
        _count: { select: { rewardBundles: true } },
      },
    });

    const breakdown = [];

    for (const promo of promotions) {
      const usedCodes = await db.couponCode.count({
        where: {
          batch: { promotionId: promo.id },
          isUsed: true,
        },
      });

      const totalCodes = promo.couponBatches.reduce(
        (sum: number, b: any) => sum + (b._count?.codes ?? 0),
        0,
      );

      breakdown.push({
        promotionId: promo.id,
        name: promo.name,
        totalCodes,
        usedCodes,
        rewardBundleCount: promo._count.rewardBundles,
        usageRate: totalCodes > 0 ? usedCodes / totalCodes : 0,
      });
    }

    return breakdown;
  }
}
