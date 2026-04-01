import { Body, Controller, Param, Post, Get, Headers, Query, BadRequestException } from '@nestjs/common';
import { DeviceService, UpdateDeviceDto } from './device.service';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post(':computerId')
  async reportOrUpdateDevice(
    @Headers('x-tenant-id') tenantId: string,
    @Param('computerId') computerId: string,
    @Body() body: UpdateDeviceDto,
  ) {
    if (!tenantId) throw new BadRequestException('Missing x-tenant-id header');
    return this.deviceService.reportOrUpdateDevice(tenantId, Number(computerId), body);
  }
  @Get('history')
  async getAllDeviceHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tenantId) throw new BadRequestException('Missing x-tenant-id config in header'); // forced recompile
    return this.deviceService.getAllDeviceHistory(
      tenantId, 
      type, 
      startDate, 
      endDate, 
      page ? parseInt(page, 10) : 1, 
      limit ? parseInt(limit, 10) : 20
    );
  }
}
