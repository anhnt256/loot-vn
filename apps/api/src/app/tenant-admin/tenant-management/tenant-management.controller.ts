import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';

@Controller('tenant-admin/tenant-management/tenants')
export class TenantManagementController {
  constructor(private readonly tenantManagementService: TenantManagementService) {}

  @Get()
  async findAll() {
    return this.tenantManagementService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tenantManagementService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.tenantManagementService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.tenantManagementService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tenantManagementService.remove(id);
  }

  @Post(':id/generate-key')
  async generateKey(@Param('id') id: string) {
    return this.tenantManagementService.generateApiKey(id);
  }
}
