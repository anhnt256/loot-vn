import { Controller, Get, Post, Put, Body, Query, Headers, BadRequestException } from '@nestjs/common';
import { HandoverReportService } from './handover-report.service';

@Controller('admin/handover-reports')
export class HandoverReportController {
  constructor(private readonly handoverReportService: HandoverReportService) {}

  @Get()
  async getReports(
    @Query('date') date: string,
    @Query('reportType') reportType: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.handoverReportService.getReports(tenantId, date, reportType);
  }

  @Get('staffs')
  async getStaffs(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.handoverReportService.getStaffs(tenantId);
  }

  @Get('materials')
  async getMaterials(
    @Query('reportType') reportType: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.handoverReportService.getMaterials(tenantId, reportType);
  }

  @Post('materials')
  async createMaterial(
    @Body() payload: any,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.handoverReportService.createMaterial(tenantId, payload);
  }

  @Put('materials')
  async updateMaterial(
    @Body() payload: any,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.handoverReportService.updateMaterial(tenantId, payload);
  }

  @Get('get-report-data')
  async getReportData(
    @Query('date') date: string,
    @Query('reportType') reportType: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!date || !reportType) {
       throw new BadRequestException('Missing required parameters: date, reportType');
    }
    return this.handoverReportService.getReportData(tenantId, date, reportType);
  }

  @Post('submit-report')
  async submitReport(
    @Body() payload: any,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.handoverReportService.submitReport(tenantId, payload);
  }
}
