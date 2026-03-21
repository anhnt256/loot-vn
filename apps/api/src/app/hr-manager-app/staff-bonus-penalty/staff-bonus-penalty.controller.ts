import { Controller, Get, Post, Body, Param, Delete, Req, BadRequestException, Query } from '@nestjs/common';
import { StaffBonusPenaltyService } from './staff-bonus-penalty.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('hr-manager/staff-bonus-penalty')
export class StaffBonusPenaltyController {
  constructor(private readonly service: StaffBonusPenaltyService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id or invalid Origin/Referer');
    return id;
  }

  @Get()
  findAll(@Req() req: any, @Query('staffId') staffId?: string) {
    return this.service.findAll(this.getTenantId(req), staffId ? +staffId : undefined);
  }

  @Post('bonus')
  createBonus(@Req() req: any, @Body() data: { staffId: number; amount: number; reason: string; note?: string; rewardDate?: string }) {
    return this.service.createBonus(this.getTenantId(req), data);
  }

  @Post('penalty')
  createPenalty(@Req() req: any, @Body() data: { staffId: number; amount: number; reason: string; note?: string; penaltyDate?: string }) {
    return this.service.createPenalty(this.getTenantId(req), data);
  }

  @Delete('bonus/:id')
  removeBonus(@Req() req: any, @Param('id') id: string) {
    return this.service.removeBonus(this.getTenantId(req), +id);
  }

  @Delete('penalty/:id')
  removePenalty(@Req() req: any, @Param('id') id: string) {
    return this.service.removePenalty(this.getTenantId(req), +id);
  }
}
