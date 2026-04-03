import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  Headers,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { OrderGateway } from './order.gateway';
import { redisService } from '../../lib/redis-service';

const pauseKey = (tenantId: string) => `${tenantId}:order:pause`;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  null:        ['PENDING', 'HUY'],
  PENDING:     ['CHAP_NHAN', 'HUY'],
  CHAP_NHAN:   ['THU_TIEN', 'HUY'],
  THU_TIEN:    ['PHUC_VU', 'HUY'],
  PHUC_VU:     ['HOAN_THANH', 'HUY'],
  HOAN_THANH:  [],
  HUY:         [],
};

@Controller('admin/orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(
    private readonly tenantGateway: TenantGatewayService,
    private readonly orderGateway: OrderGateway,
  ) {}

  /* ───────────── SHIFT MANAGEMENT ───────────── */

  /** POST /admin/orders/shift/start — nhân viên bắt đầu ca (nhận đơn) */
  @Post('shift/start')
  async startShift(
    @Headers('x-tenant-id') tenantId: string,
    @Req() req: any,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = Number(req.user?.staffId ?? req.user?.userId ?? null) || null;
    const staffName = req.user?.fullName ?? req.user?.userName ?? 'Unknown';
    if (!staffId) throw new BadRequestException('Không xác định được nhân viên');

    const db = await this.tenantGateway.getGatewayClient(tenantId);

    // Đóng ca cũ nếu còn active
    await ((db as any).staffShift as any).updateMany({
      where: { tenantId: parsedTenantId, staffId, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

    // Tạo ca mới
    const shift = await ((db as any).staffShift as any).create({
      data: {
        staffId,
        staffName,
        tenantId: parsedTenantId,
        startedAt: new Date(),
        isActive: true,
      },
    });

    // Mở lại nhận đơn nếu đang pause
    await redisService.del(pauseKey(tenantId));
    this.orderGateway.broadcastResume(tenantId);

    return { success: true, data: shift };
  }

  /** POST /admin/orders/shift/end — nhân viên kết thúc ca */
  @Post('shift/end')
  async endShift(
    @Headers('x-tenant-id') tenantId: string,
    @Req() req: any,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = Number(req.user?.staffId ?? req.user?.userId ?? null) || null;
    if (!staffId) throw new BadRequestException('Không xác định được nhân viên');

    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const updated = await ((db as any).staffShift as any).updateMany({
      where: { tenantId: parsedTenantId, staffId, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

    // Pause nhận đơn khi kết thúc ca
    const ttl = 24 * 3600; // 24h hoặc đến khi ca mới bắt đầu
    await redisService.setex(pauseKey(tenantId), ttl, {
      resumeAt: new Date(Date.now() + ttl * 1000).toISOString(),
      note: `${req.user?.fullName ?? 'Nhân viên'} đã kết thúc ca`,
      pausedAt: new Date().toISOString(),
    });
    this.orderGateway.broadcastPause(tenantId, {
      resumeAt: new Date(Date.now() + ttl * 1000).toISOString(),
      note: `${req.user?.fullName ?? 'Nhân viên'} đã kết thúc ca`,
    });

    return { success: true, count: updated.count };
  }

  /** GET /admin/orders/shift/current — lấy ca hiện tại đang active */
  @Get('shift/current')
  async getCurrentShift(
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const shift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, isActive: true },
      orderBy: { startedAt: 'desc' },
    });

    return { data: shift };
  }

  /** GET /admin/orders/all — danh sách tất cả đơn hàng (có phân trang + lọc) */
  @Get('all')
  async listAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const pageNum = Math.max(1, parseInt(page ?? '1') || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '50') || 50));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { tenantId: parsedTenantId };

    if (status && status !== 'ALL') {
      if (status === 'UNPROCESSED') {
        where.OR = [
          { status: { notIn: ['HOAN_THANH', 'HUY'] } },
          { status: null },
        ];
      } else {
        where.status = status;
      }
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { computerName: { contains: search } },
        { details: { some: { recipeName: { contains: search } } } },
      ];
    }

    const [orders, total] = await Promise.all([
      (db.foodOrder as any).findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          details: true,
          statusHistory: { orderBy: { changedAt: 'asc' } },
        },
      }),
      (db.foodOrder as any).count({ where }),
    ]);

    // Tính tổng doanh thu theo loại
    const completedWhere: any = {
      tenantId: parsedTenantId,
      status: 'HOAN_THANH',
    };
    if (from || to) {
      completedWhere.createdAt = {};
      if (from) completedWhere.createdAt.gte = new Date(from);
      if (to) completedWhere.createdAt.lte = new Date(to);
    }

    const revenueAgg = await (db.foodOrder as any).aggregate({
      where: completedWhere,
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    return {
      data: orders,
      total,
      page: pageNum,
      limit: limitNum,
      revenue: {
        totalCompleted: Number(revenueAgg._sum?.totalAmount ?? 0),
        completedCount: revenueAgg._count?.id ?? 0,
      },
    };
  }

  /** GET /admin/orders — danh sách đơn chưa hoàn thành (cho admin) */
  @Get()
  async listPending(
    @Headers('x-tenant-id') tenantId: string,
    @Req() req: any,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const orders = await (db.foodOrder as any).findMany({
      where: {
        tenantId: parsedTenantId,
        OR: [
          { status: { notIn: ['HOAN_THANH', 'HUY'] } },
          { status: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        details: true,
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    });

    return { data: orders };
  }

  /** GET /admin/orders/pause-status — trạng thái ngưng nhận đơn */
  @Get('pause-status')
  async getPauseStatus(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const raw = await redisService.get(pauseKey(tenantId));
    if (!raw) return { paused: false };
    return { paused: true, ...JSON.parse(raw) };
  }

  /** POST /admin/orders/pause — ngưng nhận đơn đến mốc thời gian resumeAt */
  @Post('pause')
  async pauseOrders(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { resumeAt: string; note?: string },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const { resumeAt, note } = body;
    if (!resumeAt) throw new BadRequestException('resumeAt is required');
    const resumeDate = new Date(resumeAt);
    if (isNaN(resumeDate.getTime()) || resumeDate <= new Date()) {
      throw new BadRequestException('resumeAt phải là thời điểm trong tương lai');
    }
    const ttlSeconds = Math.ceil((resumeDate.getTime() - Date.now()) / 1000);
    await redisService.setex(pauseKey(tenantId), ttlSeconds, {
      resumeAt,
      note: note ?? null,
      pausedAt: new Date().toISOString(),
    });
    this.orderGateway.broadcastPause(tenantId, { resumeAt, note: note ?? null });
    return { success: true };
  }

  /** DELETE /admin/orders/pause — mở lại nhận đơn ngay */
  @Delete('pause')
  async resumeOrders(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    await redisService.del(pauseKey(tenantId));
    this.orderGateway.broadcastResume(tenantId);
    return { success: true };
  }

  /**
   * PATCH /admin/orders/:id/status — admin cập nhật trạng thái đơn hàng
   * Mỗi lần chuyển trạng thái tạo một bản ghi FoodOrderStatusHistory
   */
  @Patch(':id/status')
  async updateStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; note?: string },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const { status: newStatus, note } = body;
    if (!newStatus) throw new BadRequestException('status is required');

    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = Number(req.user?.staffId ?? req.user?.userId ?? null) || null;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const order = await (db.foodOrder as any).findFirst({
      where: { id, tenantId: parsedTenantId },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    // Kiểm tra transition hợp lệ
    const currentKey = order.status ?? 'null';
    const allowed = ALLOWED_TRANSITIONS[currentKey] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${order.status ?? 'null'}" sang "${newStatus}"`,
      );
    }

    // Cập nhật status + ghi history trong transaction
    const updated = await db.$transaction(async (tx: any) => {
      const updatedOrder = await (tx as any).foodOrder.update({
        where: { id },
        data: { status: newStatus, updatedAt: new Date() },
        include: {
          details: true,
          statusHistory: { orderBy: { changedAt: 'asc' } },
        },
      });

      await (tx as any).foodOrderStatusHistory.create({
        data: {
          orderId: id,
          status: newStatus,
          changedBy: staffId,
          note: note ?? null,
          changedAt: new Date(),
        },
      });

      return updatedOrder;
    });

    // Publish WebSocket event cho client tracking
    await this.orderGateway.publishOrderStatus(tenantId, id, {
      orderId: id,
      status: newStatus,
      changedAt: new Date().toISOString(),
    });

    return { success: true, data: updated };
  }
}
