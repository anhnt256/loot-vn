import { Body, Controller, Param, Post, Headers, BadRequestException } from '@nestjs/common';
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
}
