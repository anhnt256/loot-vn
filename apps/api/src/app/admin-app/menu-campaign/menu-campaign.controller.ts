import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query, Headers, UseGuards, BadRequestException,
} from '@nestjs/common';
import { MenuCampaignService } from './menu-campaign.service';
import { CampaignEngineService } from './campaign-engine.service';
import { MenuCampaignGateway } from './menu-campaign.gateway';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('menu-campaign')
export class MenuCampaignController {
  constructor(
    private readonly service: MenuCampaignService,
    private readonly engine: CampaignEngineService,
    private readonly gateway: MenuCampaignGateway,
  ) {}

  private async notifyChange(tenantId: string, action: string) {
    await this.engine.invalidateCache(tenantId);
    await this.gateway.publishCampaignChanged(tenantId, action);
  }

  // ─── Admin CRUD ───

  @Get()
  @UseGuards(AuthGuard)
  async getAll(@Headers('x-tenant-id') tenantId: string, @Query('status') status?: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.getAll(tenantId, status);
  }

  @Get('active')
  @UseGuards(AuthGuard)
  async getActive(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.getAll(tenantId, 'ACTIVE');
  }

  @Get('budget-progress/:id')
  @UseGuards(AuthGuard)
  async getBudgetProgress(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.engine.getBudgetProgress(tenantId, parseInt(id, 10));
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.service.getById(tenantId, parseInt(id, 10));
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const result = await this.service.create(tenantId, body);
    await this.notifyChange(tenantId, 'update');
    return result;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: any) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const result = await this.service.update(tenantId, parseInt(id, 10), body);
    await this.notifyChange(tenantId, 'update');
    return result;
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  async updateStatus(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body('status') status: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!status) throw new BadRequestException('status is required');
    const result = await this.service.updateStatus(tenantId, parseInt(id, 10), status);
    await this.notifyChange(tenantId, 'update');
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const result = await this.service.delete(tenantId, parseInt(id, 10));
    await this.notifyChange(tenantId, 'update');
    return result;
  }

  // ─── Engine: Evaluate discount for cart (called from client/order) ───

  @Post('evaluate')
  @UseGuards(AuthGuard)
  async evaluate(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const { userId, rankId, machineGroupId, items } = body;
    if (!userId || !items?.length) throw new BadRequestException('userId and items are required');
    return this.engine.evaluateDiscounts(tenantId, userId, rankId ?? 0, machineGroupId ?? null, items);
  }
}
