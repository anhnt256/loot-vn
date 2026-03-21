import { Controller, Get, Post, Put, Body, Req, Query, Delete, Param } from '@nestjs/common';
import { LayoutService } from './layout.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('layout')
export class LayoutController {
  constructor(private readonly layoutService: LayoutService) {}

  @Get('zones')
  async getZones(@Req() req: any) {
    const tenantId = getTenantIdFromRequest(req);
    return this.layoutService.getZones(tenantId);
  }

  @Post('zones')
  async createZone(@Req() req: any, @Body() body: { name: string; description?: string }) {
    const tenantId = getTenantIdFromRequest(req);
    return this.layoutService.createZone(tenantId, body);
  }

  @Delete('zones/:id')
  async deleteZone(@Req() req: any, @Param('id') id: string) {
    const tenantId = getTenantIdFromRequest(req);
    return this.layoutService.deleteZone(tenantId, parseInt(id, 10));
  }

  @Get('computers')
  async getComputers(@Req() req: any) {
    const tenantId = getTenantIdFromRequest(req);
    return this.layoutService.getComputers(tenantId);
  }

  @Post('computers/move')
  async moveComputersToZone(@Req() req: any, @Body() body: { zoneId: number | null; macAddresses: string[] }) {
    const tenantId = getTenantIdFromRequest(req);
    return this.layoutService.moveComputersToZone(tenantId, body);
  }

  @Post('layouts/save')
  async saveLayouts(@Req() req: any, @Body() body: { layouts: { macAddress: string; x: number; y: number; w: number; h: number }[] }) {
    const tenantId = getTenantIdFromRequest(req);
    return this.layoutService.saveLayouts(tenantId, body);
  }
}
