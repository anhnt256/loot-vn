import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { OrgManagementService } from './org-management.service';

@Controller('tenant-admin/org-management/organizations')
export class OrgManagementController {
  constructor(private readonly orgManagementService: OrgManagementService) {}

  @Get()
  async findAll() {
    return this.orgManagementService.findAll();
  }

  @Get('by-domain')
  async findByRootDomain(@Query('rootDomain') rootDomain: string) {
    return this.orgManagementService.findByRootDomain(rootDomain);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orgManagementService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.orgManagementService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.orgManagementService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.orgManagementService.remove(id);
  }
}
