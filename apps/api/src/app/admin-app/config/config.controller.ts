import { Controller, Get, Post, Body, Req, Headers } from '@nestjs/common';
import { ConfigService } from './config.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';
import {
  getCurrentTimeVNDB,
  getStartOfDayVNDB,
  getEndOfDayVNDB,
  getStartOfWeekVNISO,
  getEndOfWeekVNISO,
  getStartOfMonthVNISO,
  getEndOfMonthVNISO,
  getCurrentDayOfWeekVN,
} from '../../lib/timezone-utils';

@Controller('system-config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('server-time')
  getServerTime() {
    return {
      now: getCurrentTimeVNDB(),
      dayOfWeek: getCurrentDayOfWeekVN(),
      startDay: getStartOfDayVNDB(),
      endDay: getEndOfDayVNDB(),
      startWeek: getStartOfWeekVNISO(),
      endWeek: getEndOfWeekVNISO(),
      startMonth: getStartOfMonthVNISO(),
      endMonth: getEndOfMonthVNISO(),
    };
  }

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
