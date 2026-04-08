import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { EventPromotionService } from './event-promotion.service';
import { CouponService } from './coupon.service';
import { EventAnalyticsService } from './event-analytics.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';
import {
  CreateEventDto,
  UpdateEventDto,
  CreatePromotionDto,
  UpdatePromotionDto,
  CreateCouponBatchDto,
} from './dto';

@Controller('event-promotion')
@UseGuards(AuthGuard)
export class EventPromotionController {
  constructor(
    private readonly eventService: EventPromotionService,
    private readonly couponService: CouponService,
    private readonly analyticsService: EventAnalyticsService,
  ) {}

  private getTenantId(tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return tenantId;
  }

  // ─── Event endpoints ───

  @Get('events')
  async getEvents(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.eventService.getEvents(this.getTenantId(tenantId), status);
  }

  @Get('events/:id')
  async getEventById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.eventService.getEventById(this.getTenantId(tenantId), id);
  }

  @Post('events')
  async createEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventService.createEvent(this.getTenantId(tenantId), dto);
  }

  @Put('events/:id')
  async updateEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(this.getTenantId(tenantId), id, dto);
  }

  @Put('events/:id/target-rules')
  async updateTargetRules(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { rules: { type: string; operator: string; value: string }[] },
  ) {
    return this.eventService.updateTargetRules(this.getTenantId(tenantId), id, body.rules);
  }

  // ─── Promotion endpoints ───

  @Post('promotions')
  async createPromotion(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    return this.eventService.createPromotion(this.getTenantId(tenantId), dto);
  }

  @Put('promotions/:id')
  async updatePromotion(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.eventService.updatePromotion(this.getTenantId(tenantId), parseInt(id, 10), dto);
  }

  @Delete('promotions/:id')
  async deletePromotion(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.eventService.deletePromotion(this.getTenantId(tenantId), parseInt(id, 10));
  }

  // ─── Coupon endpoints ───

  @Post('coupon-batches')
  async createCouponBatch(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateCouponBatchDto,
  ) {
    return this.couponService.createBatch(this.getTenantId(tenantId), dto);
  }

  @Get('coupon-batches/:id/codes')
  async getCouponCodes(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.couponService.getCouponsByBatch(
      this.getTenantId(tenantId),
      parseInt(id, 10),
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 50,
    );
  }

  @Post('coupons/validate')
  async validateCoupon(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { code: string },
  ) {
    if (!body.code) throw new BadRequestException('code is required');
    return this.couponService.validateAndUseCoupon(
      this.getTenantId(tenantId),
      body.code,
      user.userId,
    );
  }

  // ─── Analytics endpoints ───

  @Get('events/:id/analytics')
  async getAnalytics(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.analyticsService.getAnalytics(this.getTenantId(tenantId), id);
  }

  @Get('events/:id/analytics/history')
  async getAnalyticsHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getAnalyticsHistory(
      this.getTenantId(tenantId),
      id,
      limit ? parseInt(limit, 10) : 30,
    );
  }

  @Post('events/:id/analytics/snapshot')
  async generateSnapshot(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.analyticsService.generateSnapshot(this.getTenantId(tenantId), id);
  }
}
