import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { RewardPunishRulesService } from './reward-punish-rules.service';

@Controller('hr-manager/reward-punish-rules')
export class RewardPunishRulesController {
  constructor(private readonly service: RewardPunishRulesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Post('process-violation')
  processViolation(@Body() body: { staffId: number; ruleId: number; date?: string }) {
    const date = body.date ? new Date(body.date) : new Date();
    return this.service.processStaffViolation(body.staffId, body.ruleId, date);
  }
}
