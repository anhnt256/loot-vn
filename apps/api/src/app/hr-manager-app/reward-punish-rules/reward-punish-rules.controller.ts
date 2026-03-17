import { Controller, Get, Post, Body, Put, Param, Delete, Req, BadRequestException } from '@nestjs/common';
import { RewardPunishRulesService } from './reward-punish-rules.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('hr-manager/reward-punish-rules')
export class RewardPunishRulesController {
  constructor(private readonly service: RewardPunishRulesService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id or invalid Origin/Referer');
    return id;
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(this.getTenantId(req));
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(this.getTenantId(req), +id);
  }

  @Post()
  create(@Req() req: any, @Body() data: any) {
    return this.service.create(this.getTenantId(req), data);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.service.update(this.getTenantId(req), +id, data);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(this.getTenantId(req), +id);
  }

  @Post('process-violation')
  processViolation(@Req() req: any, @Body() body: { staffId: number; ruleId: number; date?: string }) {
    const date = body.date ? new Date(body.date) : new Date();
    return this.service.processStaffViolation(this.getTenantId(req), body.staffId, body.ruleId, date);
  }
}
