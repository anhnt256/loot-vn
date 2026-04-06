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
      rating?: number;
      image?: string;
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
        computerId: dto.computerId != null ? dto.computerId : null,
        userId: userId != null && !isNaN(userId) ? userId : null,
        isAnonymous: dto.isAnonymous ?? false,
        rating: dto.rating ?? 0,
        image: dto.image ?? null,
      },
    });

    // Invalidate menu cache for this user so isFeedback updates on next fetch
    if (dto.type === 'RESTOCK_REQUEST' && userId) {
      await this.menuService.invalidateMenuCacheForUser(tenantId, userId);
    }

    return result;
  }

  async findByUser(tenantId: string, userId: number) {
    const db = await this.getGatewayClient(tenantId);
    const feedbacks = await db.feedback.findMany({
      where: { userId, status: { not: 'DRAFT' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        category: true,
        rating: true,
        image: true,
        computerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { data: feedbacks };
  }

  async saveDraft(
    tenantId: string,
    userId: number,
    dto: { formData: string; computerId?: number },
  ) {
    const db = await this.getGatewayClient(tenantId);
    const existing = await db.feedback.findFirst({
      where: { userId, status: 'DRAFT' },
    });

    if (existing) {
      return db.feedback.update({
        where: { id: existing.id },
        data: {
          description: dto.formData,
          computerId: dto.computerId ?? null,
        },
      });
    }

    return db.feedback.create({
      data: {
        type: 'GENERAL',
        title: 'Draft Feedback',
        description: dto.formData,
        priority: 'MEDIUM',
        userId,
        computerId: dto.computerId ?? null,
        status: 'DRAFT',
      },
    });
  }

  async getDraft(tenantId: string, userId: number) {
    const db = await this.getGatewayClient(tenantId);
    const draft = await db.feedback.findFirst({
      where: { userId, status: 'DRAFT' },
      select: { id: true, description: true, updatedAt: true },
    });
    return draft;
  }

  async deleteDraft(tenantId: string, userId: number) {
    const db = await this.getGatewayClient(tenantId);
    const existing = await db.feedback.findFirst({
      where: { userId, status: 'DRAFT' },
    });
    if (existing) {
      await db.feedback.delete({ where: { id: existing.id } });
    }
    return { success: true };
  }

  async findById(tenantId: string, userId: number, id: number) {
    const db = await this.getGatewayClient(tenantId);
    const feedback = await db.feedback.findFirst({
      where: { id, userId },
      include: {
        computer: { select: { name: true, id: true } },
      },
    });
    if (!feedback) throw new BadRequestException('Feedback không tồn tại');
    return feedback;
  }

  /* ─── Admin methods ─── */

  async adminFindAll(
    tenantId: string,
    filters: {
      status?: string;
      priority?: string;
      category?: string;
      type?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const db = await this.getGatewayClient(tenantId);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { status: { not: 'DRAFT' } };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;
    if (filters.type) where.type = filters.type;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [data, total] = await Promise.all([
      db.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.feedback.count({ where }),
    ]);

    // Batch-lookup users & computers to avoid Prisma relation issues
    const userIds = [...new Set(data.filter((f: any) => f.userId != null).map((f: any) => Number(f.userId)))];
    const computerIds = [...new Set(data.filter((f: any) => f.computerId != null).map((f: any) => Number(f.computerId)))];

    const [users, computers] = await Promise.all([
      userIds.length > 0
        ? db.user.findMany({ where: { userId: { in: userIds } }, select: { userId: true, userName: true } })
        : [],
      computerIds.length > 0
        ? db.computer.findMany({ where: { id: { in: computerIds } }, select: { id: true, name: true } })
        : [],
    ]);

    const userMap = new Map((users as any[]).map((u) => [Number(u.userId), u]));
    const computerMap = new Map((computers as any[]).map((c) => [Number(c.id), c]));

    return {
      data: data.map((f: any) => {
        const uid = f.userId != null ? Number(f.userId) : null;
        const cid = f.computerId != null ? Number(f.computerId) : null;
        return {
          ...f,
          id: Number(f.id),
          userId: uid,
          itemId: f.itemId != null ? Number(f.itemId) : null,
          computerId: cid,
          rating: f.rating != null ? Number(f.rating) : 0,
          stars: f.stars != null ? Number(f.stars) : 0,
          user: uid != null ? (userMap.get(uid) ?? null) : null,
          computer: cid != null ? (computerMap.get(cid) ?? null) : null,
        };
      }),
      total: Number(total),
      page,
      limit,
    };
  }

  async adminFindById(tenantId: string, id: number) {
    const db = await this.getGatewayClient(tenantId);
    const feedback = await db.feedback.findUnique({ where: { id } });
    if (!feedback) throw new BadRequestException('Feedback không tồn tại');

    const uid = feedback.userId != null ? Number(feedback.userId) : null;
    const cid = feedback.computerId != null ? Number(feedback.computerId) : null;

    const [user, computer] = await Promise.all([
      uid != null ? db.user.findUnique({ where: { userId: uid }, select: { userId: true, userName: true } }) : null,
      cid != null ? db.computer.findUnique({ where: { id: cid }, select: { id: true, name: true } }) : null,
    ]);

    return {
      ...feedback,
      id: Number(feedback.id),
      userId: uid,
      itemId: feedback.itemId != null ? Number(feedback.itemId) : null,
      computerId: cid,
      rating: feedback.rating != null ? Number(feedback.rating) : 0,
      stars: feedback.stars != null ? Number(feedback.stars) : 0,
      user: user ?? null,
      computer: computer ?? null,
    };
  }

  private async ensureStatusHistoryTable(db: any) {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`FeedbackStatusHistory\` (
        \`id\`         INT          NOT NULL AUTO_INCREMENT,
        \`feedbackId\` INT          NOT NULL,
        \`fromStatus\` VARCHAR(20)  NOT NULL,
        \`toStatus\`   VARCHAR(20)  NOT NULL,
        \`changedBy\`  INT          NULL,
        \`note\`       VARCHAR(500) NULL,
        \`changedAt\`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        INDEX \`FeedbackStatusHistory_feedbackId_idx\`(\`feedbackId\`),
        INDEX \`FeedbackStatusHistory_changedAt_idx\`(\`changedAt\`),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
  }

  async adminUpdate(
    tenantId: string,
    id: number,
    dto: { status?: string; response?: string; priority?: string; note?: string; changedBy?: number },
  ) {
    const db = await this.getGatewayClient(tenantId);
    const existing = await db.feedback.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('Feedback không tồn tại');

    const updateData: any = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.response !== undefined) updateData.response = dto.response;
    if (dto.priority) updateData.priority = dto.priority;
    if (dto.note !== undefined) updateData.note = dto.note;

    const updated = await db.feedback.update({ where: { id }, data: updateData });

    // Log status change to history
    if (dto.status && dto.status !== existing.status) {
      await this.ensureStatusHistoryTable(db);
      await db.feedbackStatusHistory.create({
        data: {
          feedbackId: id,
          fromStatus: existing.status as string,
          toStatus: dto.status,
          changedBy: dto.changedBy ?? null,
        },
      });
    }

    return updated;
  }

  async adminGetStatusHistory(tenantId: string, feedbackId: number) {
    const db = await this.getGatewayClient(tenantId);
    await this.ensureStatusHistoryTable(db);
    const history = await db.feedbackStatusHistory.findMany({
      where: { feedbackId },
      orderBy: { changedAt: 'asc' },
    });
    return history.map((h: any) => ({
      ...h,
      id: Number(h.id),
      feedbackId: Number(h.feedbackId),
      changedBy: h.changedBy != null ? Number(h.changedBy) : null,
    }));
  }

  async adminGetStats(tenantId: string) {
    const db = await this.getGatewayClient(tenantId);
    const [submitted, received, processing, completed, total] = await Promise.all([
      db.feedback.count({ where: { status: 'SUBMITTED' } }),
      db.feedback.count({ where: { status: 'RECEIVED' } }),
      db.feedback.count({ where: { status: 'PROCESSING' } }),
      db.feedback.count({ where: { status: 'COMPLETED' } }),
      db.feedback.count({ where: { status: { not: 'DRAFT' } } }),
    ]);
    return {
      submitted: Number(submitted),
      received: Number(received),
      processing: Number(processing),
      completed: Number(completed),
      total: Number(total),
    };
  }
}
