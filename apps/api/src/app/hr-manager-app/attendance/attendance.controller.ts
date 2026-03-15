import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Res } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
// import { Response } from 'express';

@Controller('hr-manager/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('staffId') staffId?: string
  ) {
    return this.attendanceService.findAll({
      startDate,
      endDate,
      staffId: staffId ? parseInt(staffId, 10) : undefined,
    });
  }

  @Get('aggregated')
  async findAggregated(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.attendanceService.findAggregated({ startDate, endDate });
  }

  @Get('export')
  async export(
    @Res() res: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('staffId') staffId?: string
  ) {
    const csv = await this.attendanceService.exportToExcel({ 
      startDate, 
      endDate, 
      staffId: staffId ? parseInt(staffId, 10) : undefined 
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=ChamCong_${startDate || 'All'}_${endDate || 'All'}.csv`);
    return res.send(csv);
  }

  @Post()
  async create(@Body() data: any) {
    return this.attendanceService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.attendanceService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.attendanceService.remove(parseInt(id, 10));
  }
}
