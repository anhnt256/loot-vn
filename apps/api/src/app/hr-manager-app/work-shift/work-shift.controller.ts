import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { WorkShiftService } from './work-shift.service';
import { AuthGuard } from '../../auth/auth.guard';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('hr-manager/work-shifts')
@UseGuards(AuthGuard)
export class WorkShiftController {
  constructor(private readonly workShiftService: WorkShiftService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id or invalid Origin/Referer');
    return id;
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.workShiftService.findAll(this.getTenantId(req));
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.workShiftService.findOne(this.getTenantId(req), +id);
  }

  @Post()
  async create(@Req() req: any, @Body() data: any) {
    return this.workShiftService.create(this.getTenantId(req), data);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.workShiftService.update(this.getTenantId(req), +id, data);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.workShiftService.remove(this.getTenantId(req), +id);
  }
}
