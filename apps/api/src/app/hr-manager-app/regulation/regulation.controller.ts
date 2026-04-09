import { Controller, Get, Post, Put, Delete, Body, Param, Req, BadRequestException } from '@nestjs/common';
import { RegulationService } from './regulation.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('hr-manager/regulations')
export class RegulationController {
  constructor(private readonly service: RegulationService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id or invalid Origin/Referer');
    return id;
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(this.getTenantId(req));
  }

  @Get('latest')
  findLatest(@Req() req: any) {
    return this.service.findLatest(this.getTenantId(req));
  }

  @Post()
  create(@Req() req: any, @Body() body: { title: string; content: string; createdBy?: string }) {
    return this.service.create(this.getTenantId(req), body);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: { title?: string; content?: string }) {
    return this.service.update(this.getTenantId(req), +id, body);
  }

  @Post(':id/publish')
  publish(@Req() req: any, @Param('id') id: string) {
    return this.service.publish(this.getTenantId(req), +id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(this.getTenantId(req), +id);
  }

  @Get(':id/acknowledgments')
  getAcknowledgments(@Req() req: any, @Param('id') id: string) {
    return this.service.getAcknowledgments(this.getTenantId(req), +id);
  }

  @Get(':id/unacknowledged')
  getUnacknowledgedStaff(@Req() req: any, @Param('id') id: string) {
    return this.service.getUnacknowledgedStaff(this.getTenantId(req), +id);
  }

  @Post(':id/acknowledge')
  acknowledge(@Req() req: any, @Param('id') id: string, @Body() body: { staffId: number }) {
    return this.service.acknowledge(this.getTenantId(req), +id, body.staffId);
  }
}
