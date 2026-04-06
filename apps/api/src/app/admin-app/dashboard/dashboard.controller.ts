import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';
import { redisService } from '../../lib/redis-service';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { OrderGateway } from '../order/order.gateway';
import { DashboardService } from './dashboard.service';
import { randomBytes } from 'crypto';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(
    private readonly tenantGateway: TenantGatewayService,
    private readonly orderGateway: OrderGateway,
    private readonly dashboardService: DashboardService,
  ) {}

  private cartKey(tenantId: string, macAddress: string): string {
    return `${tenantId}:cart:${macAddress}`;
  }

  private orderLockKey(tenantId: string, macAddress: string): string {
    return `${tenantId}:order_lock:${macAddress}`;
  }

  @Get('cart')
  async getCart(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!user.macAddress) throw new BadRequestException('Không xác định được máy (macAddress thiếu trong token)');
    const raw = await redisService.get(this.cartKey(tenantId, user.macAddress));
    return { data: raw ? JSON.parse(raw) : [] };
  }

  @Post('cart')
  async saveCart(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { cart: any[] },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!user.macAddress) throw new BadRequestException('Không xác định được máy (macAddress thiếu trong token)');
    await redisService.set(this.cartKey(tenantId, user.macAddress), JSON.stringify(body.cart ?? []));
    return { success: true };
  }

  /** GET /dashboard/orders — đơn hàng gần nhất của đúng user + máy này (tối đa 10) */
  @Get('orders')
  async getOrders(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!user.macAddress) throw new BadRequestException('Không xác định được máy (macAddress thiếu trong token)');
    const parsedTenantId = parseInt(tenantId) || 1;

    const db = await this.tenantGateway.getGatewayClient(tenantId);
    const orders = await (db.foodOrder as any).findMany({
      where: { macAddress: user.macAddress, userId: user.userId, tenantId: parsedTenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { details: true },
    });

    return { data: orders };
  }

  @Delete('cart')
  async clearCart(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!user.macAddress) throw new BadRequestException('Không xác định được máy (macAddress thiếu trong token)');
    await redisService.del(this.cartKey(tenantId, user.macAddress));
    return { success: true };
  }

  /**
   * POST /dashboard/checkout
   *
   * Luồng:
   * 1. Lấy giỏ hàng từ Redis (fallback: cart từ body nếu Redis trống)
   * 2. Acquire distributed lock theo macAddress (SET NX EX 5)
   * 3. Query active RecipeVersion → snapshot công thức + giá tại thời điểm đặt
   * 4. Tạo FoodOrder + FoodOrderDetail trong $transaction (status = null)
   * 5. Release lock, xóa cart Redis
   */
  @Post('checkout')
  async checkout(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { cart?: any[] },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!user.macAddress) throw new BadRequestException('Không xác định được máy (macAddress thiếu trong token)');

    const { macAddress, userId, computerName } = user;

    // 1. Lấy giỏ hàng: ưu tiên Redis, fallback sang body
    let cart: any[] = [];
    const raw = await redisService.get(this.cartKey(tenantId, macAddress));
    if (raw) {
      cart = JSON.parse(raw);
    } else if (Array.isArray(body?.cart) && body.cart.length > 0) {
      cart = body.cart;
    }
    if (!cart.length) throw new BadRequestException('Giỏ hàng trống');

    // Kiểm tra phải có ca đang active mới cho đặt hàng
    const db = await this.tenantGateway.getGatewayClient(tenantId);
    const parsedTenantId = parseInt(tenantId) || 1;
    const activeShift = await ((db as any).staffShift as any).findFirst({
      where: { tenantId: parsedTenantId, isActive: true },
    });
    if (!activeShift) {
      throw new BadRequestException('Hiện tại chưa có nhân viên nhận ca. Vui lòng chờ nhân viên nhận ca trước khi đặt hàng.');
    }

    // Kiểm tra trạng thái ngưng nhận đơn
    const pauseRaw = await redisService.get(`${tenantId}:order:pause`);
    if (pauseRaw) {
      const pause = JSON.parse(pauseRaw);
      const resumeAt = new Date(pause.resumeAt);
      const diffMs = resumeAt.getTime() - Date.now();
      const h = Math.floor(diffMs / 3600000);
      const m = Math.floor((diffMs % 3600000) / 60000);
      const s = Math.floor((diffMs % 60000) / 1000);
      const remaining = h > 0 ? `${h} giờ ${m} phút` : m > 0 ? `${m} phút ${s} giây` : `${s} giây`;
      const noteMsg = pause.note ? ` (${pause.note})` : '';
      throw new BadRequestException(`Hệ thống tạm ngưng nhận đơn${noteMsg}. Bạn có thể đặt hàng trong ${remaining} nữa.`);
    }

    // 2. Acquire distributed lock theo macAddress (5 giây TTL)
    const lockKey = this.orderLockKey(tenantId, macAddress);
    const lockValue = randomBytes(16).toString('hex');
    const acquired = await redisService.acquireLock(lockKey, 5, lockValue);
    if (!acquired) {
      throw new ConflictException('Hệ thống đang xử lý đơn hàng của bạn, vui lòng thử lại');
    }

    try {
      // 3. Lấy active RecipeVersion từ DB cho từng món
      const recipeIds: number[] = cart.map((ci: any) => ci.item?.id).filter(Boolean);

      const activeVersions = await (db.recipeVersion as any).findMany({
        where: {
          recipeId: { in: recipeIds },
          isActive: true,
          tenantId: parsedTenantId,
        },
        include: {
          items: {
            include: {
              material: { select: { id: true, name: true, baseUnit: true } },
            },
          },
        },
        orderBy: { effectiveFrom: 'desc' },
      });

      // Map recipeId → latest active version
      const versionMap = new Map<number, any>();
      for (const v of activeVersions) {
        if (!versionMap.has(v.recipeId)) {
          versionMap.set(v.recipeId, v);
        }
      }

      // 4. Chuẩn bị detail data với snapshot
      let totalAmount = 0;
      const detailsData = cart.map((ci: any) => {
        const recipeId: number = ci.item?.id;
        const quantity: number = ci.quantity ?? 1;
        const salePrice: number = Number(ci.item?.salePrice ?? 0);
        const subtotal = salePrice * quantity;
        totalAmount += subtotal;

        const version = versionMap.get(recipeId);
        return {
          recipeId,
          recipeVersionId: version?.id ?? 0,
          recipeName: ci.item?.name ?? '',
          salePrice,
          quantity,
          subtotal,
          note: ci.note ?? null,
          recipeSnapshot: JSON.stringify(version?.items ?? []),
        };
      });

      // 5. Tạo FoodOrder + FoodOrderDetail trong transaction — status = PENDING
      const order = await db.$transaction(async (tx: any) => {
        return tx.foodOrder.create({
          data: {
            userId,
            macAddress,
            computerName: computerName ?? null,
            tenantId: parsedTenantId,
            status: 'PENDING',
            totalAmount,
            details: { create: detailsData },
          },
          include: { details: true },
        });
      });

      // 6. Xóa cart Redis
      await redisService.del(this.cartKey(tenantId, macAddress));

      // 7. Tạo status history ban đầu (null → PENDING ngầm định)
      await (db as any).foodOrderStatusHistory.create({
        data: { orderId: order.id, status: 'PENDING', changedBy: null, note: 'Đơn mới' },
      });

      // 8. Publish WebSocket event cho admin
      await this.orderGateway.publishNewOrder(tenantId, order);

      return { success: true, data: order };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) throw error;
      console.error('Checkout error:', error);
      throw new InternalServerErrorException('Đặt hàng thất bại, vui lòng thử lại');
    } finally {
      await redisService.releaseLock(lockKey, lockValue).catch(() => {/* silent */});
    }
  }

  // ─── Game Check-in Endpoints ───

  /** GET /dashboard/me — lấy thông tin game user (identity + stats) cho client-app */
  @Get('me')
  async getClientMe(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');

    const stats = await this.dashboardService.getUserCalculator(tenantId, [user.userId]);
    const userStats = stats[0] || {};

    return {
      userId: user.userId,
      userName: userStats.userName || user.userName,
      fullName: user.fullName,
      computerName: user.computerName,
      macAddress: user.macAddress,
      role: user.role,
      // Game stats
      stars: userStats.stars ?? 0,
      totalPlayMinutes: userStats.totalPlayMinutes ?? 0,
      totalCheckIn: userStats.totalCheckIn ?? 0,
      claimedCheckIn: userStats.claimedCheckIn ?? 0,
      availableCheckIn: userStats.availableCheckIn ?? 0,
      round: userStats.round ?? 0,
      giftRound: userStats.giftRound ?? 0,
      totalPayment: userStats.totalPayment ?? 0,
      magicStone: userStats.magicStone ?? 0,
      battlePass: userStats.battlePass ?? null,
    };
  }

  /** POST /dashboard/user-calculator — tính stats cho list users (client-app dùng) */
  @Post('user-calculator')
  async userCalculator(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { listUsers?: number[] },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const listUsers = body?.listUsers?.length
      ? body.listUsers
      : [user.userId].filter(Boolean);
    if (!listUsers.length) throw new BadRequestException('Không xác định được userId');
    const data = await this.dashboardService.getUserCalculator(tenantId, listUsers);
    return { data };
  }

  /** POST /dashboard/check-in — claim check-in rewards */
  @Post('check-in')
  async checkIn(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { userId: number },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const userId = body.userId || user.userId;
    if (!userId) throw new BadRequestException('userId is required');

    try {
      const data = await this.dashboardService.createCheckIn(tenantId, userId);
      return { success: true, data };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(error?.message || 'Lỗi khi check-in');
    }
  }

  /** GET /dashboard/check-in-result/:userId — lịch sử check-in tháng hiện tại */
  @Get('check-in-result/:userId')
  async getCheckInResult(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userIdParam: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) throw new BadRequestException('Invalid userId');

    const data = await this.dashboardService.getCheckInResults(tenantId, userId);
    return data;
  }

  // ─── Reward Exchange Endpoints ───

  /** GET /dashboard/rewards — danh sách phần thưởng khả dụng */
  @Get('rewards')
  async getRewards(
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.dashboardService.getRewards(tenantId);
  }

  /** POST /dashboard/reward-exchange — đổi sao lấy thưởng */
  @Post('reward-exchange')
  async exchangeReward(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { rewardId: number },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!body.rewardId) throw new BadRequestException('rewardId is required');
    return this.dashboardService.exchangeReward(tenantId, user.userId, body.rewardId);
  }

  /** GET /dashboard/reward-history — lịch sử đổi thưởng */
  @Get('reward-history')
  async getRewardHistory(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.dashboardService.getRewardHistory(
      tenantId,
      user.userId,
      parseInt(page || '1', 10),
      parseInt(limit || '5', 10),
    );
  }
}
