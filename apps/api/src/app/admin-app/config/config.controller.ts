import { Controller, Get, Post, Body, Req, Headers } from '@nestjs/common';
import { ConfigService } from './config.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('system-config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getConfigs(@Req() req: any, @Headers('x-tenant-id') xTenantId: string) {
    const tenantId = xTenantId || getTenantIdFromRequest(req);
    return this.configService.getConfigs(tenantId);
  }

  @Post()
  async updateConfigs(
    @Req() req: any,
    @Headers('x-tenant-id') xTenantId: string,
    @Body() body: Record<string, string | number>
  ) {
    const tenantId = xTenantId || getTenantIdFromRequest(req);
    return this.configService.updateConfigs(tenantId, body);
  }
}
