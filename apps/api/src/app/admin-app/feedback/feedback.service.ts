import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly menuService: MenuService,
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

  async create(
    tenantId: string,
    userId: number,
    dto: {
      type: string;
      title: string;
      description: string;
      priority?: string;
      category?: string;
      note?: string;
      itemId?: number;
      computerId?: number;
      isAnonymous?: boolean;
    },
  ) {
    const db = await this.getGatewayClient(tenantId);
    const result = await db.feedback.create({
      data: {
        type: dto.type as any,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
        category: dto.category ?? null,
        note: dto.note ?? null,
        itemId: dto.itemId ?? null,
        computerId: dto.computerId ?? null,
        userId: userId || null,
        isAnonymous: dto.isAnonymous ?? false,
      },
    });

    // Invalidate menu cache for this user so isFeedback updates on next fetch
    if (dto.type === 'RESTOCK_REQUEST' && userId) {
      await this.menuService.invalidateMenuCacheForUser(tenantId, userId);
    }

    return result;
  }
}
