import { Controller, Post, Get, Delete, Patch, Param, Body, Query, Headers, BadRequestException, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';

@Controller('feedback')
@UseGuards(AuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body()
    dto: {
      type: string;
      title: string;
      description: string;
      priority?: string;
      category?: string;
      note?: string;
      itemId?: number;
      isAnonymous?: boolean;
      rating?: number;
      image?: string;
    },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.create(tenantId, user.userId, { ...dto, computerId: user.computerId });
  }

  @Post('draft')
  async saveDraft(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() dto: { formData: string },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.saveDraft(tenantId, user.userId, { ...dto, computerId: user.computerId });
  }

  @Get('draft')
  async getDraft(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.getDraft(tenantId, user.userId);
  }

  @Delete('draft')
  async deleteDraft(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.deleteDraft(tenantId, user.userId);
  }

  @Get()
  async findByUser(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.findByUser(tenantId, user.userId);
  }

  @Get(':id')
  async findById(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.findById(tenantId, user.userId, id);
  }

  /* ─── Admin endpoints ─── */

  @Get('admin/all')
  async adminFindAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.adminFindAll(tenantId, {
      status, priority, category, type, search, startDate, endDate,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('admin/stats')
  async adminGetStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.adminGetStats(tenantId);
  }

  @Get('admin/:id')
  async adminFindById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.adminFindById(tenantId, id);
  }

  @Patch('admin/:id')
  async adminUpdate(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { status?: string; response?: string; priority?: string },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.adminUpdate(tenantId, id, { ...dto, changedBy: user.userId });
  }

  @Get('admin/:id/history')
  async adminGetStatusHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.feedbackService.adminGetStatusHistory(tenantId, id);
  }
}
