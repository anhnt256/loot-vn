import { Controller, Get, Post, Body, Req, Headers, UseGuards } from '@nestjs/common';
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
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';

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

  @Get('momo-credential')
  async getMomoCredential(@Req() req: any, @Headers('x-tenant-id') xTenantId: string) {
    const tenantId = xTenantId || getTenantIdFromRequest(req);
    return this.configService.getMomoCredential(tenantId);
  }

  @Post('momo-credential')
  async upsertMomoCredential(
    @Req() req: any,
    @Headers('x-tenant-id') xTenantId: string,
    @Body() body: { storeId?: string; momoUrl: string; merchantId?: string; username: string; password?: string }
  ) {
    const tenantId = xTenantId || getTenantIdFromRequest(req);
    return this.configService.upsertMomoCredential(tenantId, body);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Req() req: any,
    @Headers('x-tenant-id') xTenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    const tenantId = xTenantId || getTenantIdFromRequest(req);
    return this.configService.changePassword(user.userName, tenantId, body);
  }
}
