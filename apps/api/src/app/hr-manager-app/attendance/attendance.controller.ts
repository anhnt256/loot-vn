import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('hr-manager/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id or invalid Origin/Referer');
    return id;
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('staffId') staffId?: string
  ) {
    return this.attendanceService.findAll(this.getTenantId(req), {
      startDate,
      endDate,
      staffId: staffId ? parseInt(staffId, 10) : undefined,
    });
  }

  @Get('aggregated')
  async findAggregated(@Req() req: any, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.attendanceService.findAggregated(this.getTenantId(req), { startDate, endDate });
  }

  @Get('export')
  async export(
    @Req() req: any,
    @Res() res: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('staffId') staffId?: string
  ) {
    const csv = await this.attendanceService.exportToExcel(this.getTenantId(req), {
      startDate,
      endDate,
      staffId: staffId ? parseInt(staffId, 10) : undefined,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=ChamCong_${startDate || 'All'}_${endDate || 'All'}.csv`);
    return res.send(csv);
  }

  @Post()
  async create(@Req() req: any, @Body() data: any) {
    return this.attendanceService.create(this.getTenantId(req), data);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.attendanceService.update(this.getTenantId(req), parseInt(id, 10), data);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.attendanceService.remove(this.getTenantId(req), parseInt(id, 10));
  }
}
