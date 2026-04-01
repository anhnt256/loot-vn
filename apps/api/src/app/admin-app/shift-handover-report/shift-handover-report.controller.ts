import { Controller, Get, Post, Body, Query, Headers, BadRequestException } from '@nestjs/common';
import { ShiftHandoverReportService } from './shift-handover-report.service';
import { CreateShiftReportDto } from './dto/create-shift-report.dto';
import { FilterShiftReportDto } from './dto/filter-shift-report.dto';

@Controller('admin-app/shift-reports')
export class ShiftHandoverReportController {
  constructor(private readonly shiftReportService: ShiftHandoverReportService) {}

  private extractTenantId(headers: any) {
     const tenantId = headers['x-tenant-id'] || headers['tenant-id'];
     if (!tenantId) throw new BadRequestException('Thiếu tenant_id trong Header');
     return tenantId;
  }

  @Post()
  create(@Headers() headers: any, @Body() createDto: CreateShiftReportDto) {
    return this.shiftReportService.create(this.extractTenantId(headers), createDto);
  }

  @Get('autofill')
  getAutofillData(@Headers() headers: any, @Query('date') date: string, @Query('workShiftId') workShiftId: string) {
    if (!date || !workShiftId) throw new BadRequestException('Missing parameters');
    return this.shiftReportService.getAutofillData(this.extractTenantId(headers), date, parseInt(workShiftId, 10));
  }

  @Get()
  findAll(@Headers() headers: any, @Query() filterDto: FilterShiftReportDto) {
    return this.shiftReportService.findAll(this.extractTenantId(headers), filterDto);
  }
}
