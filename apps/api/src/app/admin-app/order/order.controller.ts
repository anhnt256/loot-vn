import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Headers,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { MasterPrismaService } from '../../database/prisma.service';
import { OrderGateway } from './order.gateway';
import { StockService, STOCK_RESERVED_STATUSES } from './stock.service';
import { MenuService } from '../menu/menu.service';
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
    private readonly masterPrisma: MasterPrismaService,
    private readonly orderGateway: OrderGateway,
    private readonly stockService: StockService,
    private readonly menuService: MenuService,
  ) {}

  /* ───────────── SHIFT MANAGEMENT ───────────── */

  /** POST /admin/orders/shift/start — nhân viên bắt đầu ca (nhận đơn) */
  @Post('shift/start')
  async startShift(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = user.staffId ?? user.userId;
    const staffName = user.fullName ?? user.userName;
    if (!staffId) throw new BadRequestException('Không xác định được nhân viên');

    const db = await this.tenantGateway.getGatewayClient(tenantId);

    // Kiểm tra nhân viên có được phép nhận ca không (phải có ca làm việc được thiết lập)
    const NON_SHIFT_TYPES = ['MANAGER', 'SUPER_ADMIN', 'BRANCH_ADMIN'];
    if (user.staffType && NON_SHIFT_TYPES.includes(user.staffType)) {
      throw new BadRequestException(
        `Tài khoản "${staffName}" (${user.staffType}) không được phép nhận ca. Chỉ nhân viên ca mới được nhận ca.`,
      );
    }

    const staffRecord = await (db as any).staff?.findFirst?.({
      where: { id: staffId, isDeleted: false },
      select: { workShiftId: true, staffType: true },
    });
    if (staffRecord && !staffRecord.workShiftId) {
      throw new BadRequestException(
        `Tài khoản "${staffName}" chưa được thiết lập ca làm việc. Vui lòng liên hệ quản lý để được phân ca.`,
      );
    }

    // Kiểm tra xem có ai khác đang nhận ca không — 1 ca chỉ cho phép 1 người
    const activeShift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, isActive: true },
    });
    if (activeShift && activeShift.staffId !== staffId) {
      throw new BadRequestException(
        `Nhân viên "${activeShift.staffName}" đang nhận ca. Chỉ cho phép 1 người nhận đơn mỗi ca.`,
      );
    }

    // Đóng ca cũ nếu chính mình còn active
    if (activeShift && activeShift.staffId === staffId) {
      await ((db as any).staffShift as any).updateMany({
        where: { tenantId: parsedTenantId, staffId, isActive: true },
        data: { isActive: false, endedAt: new Date() },
      });
    }

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

  /** POST /admin/orders/shift/end — nhân viên kết thúc ca (chỉ shift owner) */
  @Post('shift/end')
  async endShift(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = user.staffId ?? user.userId;
    if (!staffId) throw new BadRequestException('Không xác định được nhân viên');

    const db = await this.tenantGateway.getGatewayClient(tenantId);

    // Chỉ shift owner mới được kết ca
    const activeShift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, isActive: true },
    });
    if (activeShift && activeShift.staffId !== staffId) {
      throw new BadRequestException(
        `Chỉ "${activeShift.staffName}" (người nhận ca) mới có thể kết ca`,
      );
    }

    const updated = await ((db as any).staffShift as any).updateMany({
      where: { tenantId: parsedTenantId, staffId, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

    // Pause nhận đơn khi kết thúc ca (không hẹn giờ mở lại)
    const ttl = 24 * 3600; // TTL Redis key, tự hết hạn sau 24h
    await redisService.setex(pauseKey(tenantId), ttl, {
      resumeAt: null,
      note: null,
      pausedAt: new Date().toISOString(),
    });
    this.orderGateway.broadcastPause(tenantId, {
      resumeAt: null as any,
      note: null,
    });

    return { success: true, count: updated.count };
  }

  /** GET /admin/orders/shift/current — lấy ca hiện tại đang active */
  @Get('shift/current')
  async getCurrentShift(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = user.staffId ?? user.userId;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const shift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, isActive: true },
      orderBy: { startedAt: 'desc' },
    });

    // Xác định WorkShift schedule từ JWT workShifts — match theo giờ hiện tại
    let workShiftSchedule: { startTime: string; endTime: string; isOvernight: boolean } | null = null;
    if (shift && user.workShifts?.length) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const ws of user.workShifts) {
        const [sH, sM] = String(ws.startTime).split(':').map(Number);
        const [eH, eM] = String(ws.endTime).split(':').map(Number);
        const start = sH * 60 + sM;
        const end = eH * 60 + eM;
        const overnight = !!ws.isOvernight;

        const inShift = overnight
          ? (currentMinutes >= start || currentMinutes <= end)
          : (currentMinutes >= start && currentMinutes <= end);

        if (inShift) {
          workShiftSchedule = {
            startTime: String(ws.startTime),
            endTime: String(ws.endTime),
            isOvernight: overnight,
          };
          break;
        }
      }
    }

    return {
      data: shift,
      isOwner: !!shift && shift.staffId === staffId,
      workShiftSchedule,
    };
  }

  /** GET /admin/orders/shift/summary — tổng hợp thông tin ca trước khi kết ca */
  @Get('shift/summary')
  async getShiftSummary(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = user.staffId ?? user.userId;
    if (!staffId) throw new BadRequestException('Không xác định được nhân viên');

    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const activeShift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, isActive: true },
    });
    if (!activeShift) throw new BadRequestException('Không có ca nào đang hoạt động');
    if (activeShift.staffId !== staffId) {
      throw new BadRequestException(`Chỉ "${activeShift.staffName}" mới có thể xem tổng hợp ca`);
    }

    const shiftStart = new Date(activeShift.startedAt);
    const whereInShift = { tenantId: parsedTenantId, createdAt: { gte: shiftStart } };

    // Đếm đơn theo status + tính doanh thu hoàn thành
    const [totalOrders, completedAgg, statusCounts] = await Promise.all([
      (db.foodOrder as any).count({ where: whereInShift }),
      (db.foodOrder as any).aggregate({
        where: { ...whereInShift, status: 'HOAN_THANH' },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      (db.foodOrder as any).groupBy({
        by: ['status'],
        where: whereInShift,
        _count: { id: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const g of statusCounts as any[]) {
      byStatus[g.status ?? 'PENDING'] = g._count.id;
    }

    return {
      shift: {
        id: activeShift.id,
        staffName: activeShift.staffName,
        startedAt: activeShift.startedAt,
      },
      totalOrders,
      totalRevenue: Number(completedAgg._sum?.totalAmount ?? 0),
      completedOrders: completedAgg._count?.id ?? 0,
      byStatus,
    };
  }

  /** GET /admin/orders/all — danh sách đơn hàng trong ca làm việc của user (có phân trang + lọc) */
  @Get('all')
  async listAll(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = user.staffId ?? user.userId;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    // Tìm ca làm việc hiện tại hoặc gần nhất của user
    const shift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, staffId },
      orderBy: { startedAt: 'desc' },
    });

    const pageNum = Math.max(1, parseInt(page ?? '1') || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '50') || 50));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { tenantId: parsedTenantId };
    const andConditions: any[] = [];

    // Giới hạn đơn hàng trong phạm vi ca + đơn chưa hoàn thành từ ca trước
    const shiftDateRange: any = {};
    if (shift) {
      shiftDateRange.gte = new Date(shift.startedAt);
      if (shift.endedAt) shiftDateRange.lte = new Date(shift.endedAt);

      andConditions.push({
        OR: [
          { createdAt: shiftDateRange },
          {
            createdAt: { lt: new Date(shift.startedAt) },
            status: { notIn: ['HOAN_THANH', 'HUY'] },
          },
        ],
      });
    }

    if (status && status !== 'ALL') {
      if (status === 'UNPROCESSED') {
        andConditions.push({
          OR: [
            { status: { notIn: ['HOAN_THANH', 'HUY'] } },
            { status: null },
          ],
        });
      } else {
        where.status = status;
      }
    }

    if (from || to) {
      const dateFilter: any = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      andConditions.push({ createdAt: dateFilter });
    }

    if (search) {
      andConditions.push({
        OR: [
          { computerName: { contains: search } },
          { details: { some: { recipeName: { contains: search } } } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
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

    // Tính tổng doanh thu trong ca (chỉ đơn được tạo trong ca)
    const completedWhere: any = {
      tenantId: parsedTenantId,
      status: 'HOAN_THANH',
    };
    if (shiftDateRange.gte) {
      completedWhere.createdAt = { ...shiftDateRange };
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
      shift: shift ? { id: shift.id, startedAt: shift.startedAt, endedAt: shift.endedAt } : null,
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
   *
   * Stock flow:
   *   CHAP_NHAN  → trừ kho Redis (reserve — kiểm tra tồn kho)
   *   HOAN_THANH → trừ kho DB (commit vĩnh viễn + audit log)
   *   HUY        → hoàn trả kho Redis nếu đã reserve trước đó
   */
  @Patch(':id/status')
  async updateStatus(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; note?: string },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const { status: newStatus, note } = body;
    if (!newStatus) throw new BadRequestException('status is required');

    const parsedTenantId = parseInt(tenantId) || 1;
    const staffId = user.staffId ?? user.userId;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    // Chỉ shift owner mới được thao tác đơn hàng
    const activeShift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, isActive: true },
    });
    if (!activeShift) {
      throw new BadRequestException('Chưa có ca nào đang hoạt động. Cần nhận ca trước.');
    }
    if (activeShift.staffId !== staffId) {
      throw new BadRequestException(
        `Chỉ "${activeShift.staffName}" (người nhận ca) mới có thể thao tác đơn hàng`,
      );
    }

    const order = await (db.foodOrder as any).findFirst({
      where: { id, tenantId: parsedTenantId },
      include: { details: true },
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

    // ── CHAP_NHAN: reserve kho trong Redis (trước khi cập nhật DB) ──
    let stockReserved = false;
    if (newStatus === 'CHAP_NHAN') {
      await this.stockService.reserveStock(tenantId, order.details);
      stockReserved = true;
    }

    try {
      // Cập nhật status + ghi history (+ trừ kho DB nếu HOAN_THANH) trong transaction
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

        // ── HOAN_THANH: trừ kho DB vĩnh viễn + ghi audit log ──
        if (newStatus === 'HOAN_THANH') {
          await this.stockService.commitStockInTx(
            tx,
            parsedTenantId,
            id,
            order.details,
          );
        }

        return updatedOrder;
      });

      // ── HUY: hoàn trả kho Redis nếu đã reserve ──
      if (newStatus === 'HUY' && STOCK_RESERVED_STATUSES.includes(order.status)) {
        await this.stockService.releaseStock(tenantId, order.details);
      }

      // Publish WebSocket event cho client tracking
      await this.orderGateway.publishOrderStatus(tenantId, id, {
        orderId: id,
        status: newStatus,
        changedAt: new Date().toISOString(),
      });

      // Invalidate menu cache + thông báo client khi tồn kho thay đổi
      if (newStatus === 'CHAP_NHAN' || newStatus === 'HOAN_THANH' || newStatus === 'HUY') {
        await this.menuService.invalidateAllMenuCache(tenantId);
        this.orderGateway.broadcastMenuUpdate(tenantId);
      }

      return { success: true, data: updated };
    } catch (err) {
      // Nếu đã reserve Redis nhưng DB transaction thất bại → rollback Redis
      if (stockReserved) {
        await this.stockService.releaseStock(tenantId, order.details).catch(() => {});
      }
      throw err;
    }
  }

  /** POST /admin/orders/stock/sync — đồng bộ tồn kho từ DB sang Redis */
  @Post('stock/sync')
  async syncStock(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const count = await this.stockService.syncStock(tenantId);
    return { success: true, synced: count };
  }

  /** GET /admin/orders/:id/receipt — lấy dữ liệu bill cho đơn hàng để in */
  @Get(':id/receipt')
  async getReceipt(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const parsedTenantId = parseInt(tenantId) || 1;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    // Lấy đơn hàng + chi tiết
    const order = await (db.foodOrder as any).findFirst({
      where: { id, tenantId: parsedTenantId },
      include: {
        details: true,
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    // Lấy tên cửa hàng từ master DB
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
      select: { name: true, description: true },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
        select: { name: true, description: true },
      });
    }

    // Lấy thông tin nhân viên từ ca hiện tại hoặc status history
    let staffName = user.fullName ?? user.userName ?? 'N/A';
    const activeShift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, isActive: true },
    });
    if (activeShift) {
      staffName = activeShift.staffName;
    }

    // Format thời gian
    const createdAt = new Date(order.createdAt);
    const timeStr = `${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${String(createdAt.getDate()).padStart(2, '0')}/${String(createdAt.getMonth() + 1).padStart(2, '0')}/${createdAt.getFullYear()}`;

    return {
      storeName: tenant?.name ?? 'Cửa hàng',
      storeAddress: tenant?.description ?? '',
      dateTime: `${timeStr}, ${dateStr}`,
      staffName,
      machineName: order.computerName || order.macAddress || '---',
      customerName: null,
      items: (order.details as any[]).map((d: any) => ({
        name: d.recipeName,
        note: d.note,
        quantity: d.quantity,
        price: Number(d.salePrice),
        subtotal: Number(d.subtotal),
      })),
      totalAmount: Number(order.totalAmount),
      footerLine1: null,
      footerLine2: null,
    };
  }
}
