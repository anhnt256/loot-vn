import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PromotionRewardService } from './promotion-reward.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';

@Controller('promotion-reward')
export class PromotionRewardController {
  constructor(private readonly service: PromotionRewardService) {}

  // ─── Static GET routes FIRST ───

  @Get('redemptions')
  @UseGuards(AuthGuard)
  async getRedemptions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.getRedemptions(tenantId, status, from, to);
  }

  @Get('report/summary')
  @UseGuards(AuthGuard)
  async getReportSummary(
    @Headers('x-tenant-id') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('workShiftId') workShiftId?: string,
    @Query('rewardType') rewardType?: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!from || !to) throw new BadRequestException('from and to are required (YYYY-MM-DD)');
    return this.service.getReportSummary(
      tenantId, from, to,
      workShiftId ? parseInt(workShiftId, 10) : undefined,
      rewardType,
    );
  }

  @Get('available')
  async getAvailable(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.getAvailable(tenantId);
  }

  @Get('menu-options')
  @UseGuards(AuthGuard)
  async getMenuOptions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('rewardType') rewardType: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!rewardType || !['FOOD', 'DRINK'].includes(rewardType)) {
      throw new BadRequestException('rewardType must be FOOD or DRINK');
    }
    return this.service.getMenuOptions(tenantId, rewardType);
  }

  @Get('my-history')
  @UseGuards(AuthGuard)
  async getMyHistory(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.getMyHistory(tenantId, user.userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.getAll(tenantId);
  }

  // ─── Static POST/PUT/PATCH routes BEFORE parameterized ───

  @Post('redeem')
  @UseGuards(AuthGuard)
  async redeem(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { rewardId: number; chosenRecipeId?: number },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!body.rewardId) throw new BadRequestException('rewardId is required');
    return this.service.redeem(tenantId, user.userId, body.rewardId, body.chosenRecipeId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: any,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.create(tenantId, body);
  }

  @Put('reorder')
  @UseGuards(AuthGuard)
  async reorder(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { items: { id: number; displayOrder: number }[] },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.reorder(tenantId, body.items);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.update(tenantId, parseInt(id, 10), body);
  }

  // ─── Parameterized PATCH routes ───

  @Patch('redemptions/:id/approve')
  @UseGuards(AuthGuard)
  async approveRedemption(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { workShiftId?: number },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.approveRedemption(tenantId, parseInt(id, 10), user?.userId || 0, body.workShiftId);
  }

  @Patch('redemptions/:id/complete')
  @UseGuards(AuthGuard)
  async completeRedemption(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.completeRedemption(tenantId, parseInt(id, 10));
  }

  @Patch('redemptions/:id/reject')
  @UseGuards(AuthGuard)
  async rejectRedemption(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { note?: string },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.rejectRedemption(tenantId, parseInt(id, 10), body.note);
  }

  @Patch(':id/toggle')
  @UseGuards(AuthGuard)
  async toggleActive(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.toggleActive(tenantId, parseInt(id, 10));
  }
}
