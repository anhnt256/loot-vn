import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  /** Public – client-app và admin-app đều gọi được */
  @Get('status')
  async getStatus(
    @Req() req: any,
    @Headers('x-tenant-id') xTenantId: string,
  ) {
    const tenantId = xTenantId || getTenantIdFromRequest(req);
    return this.maintenanceService.getStatus(tenantId);
  }

  /** Chỉ SUPER_ADMIN mới được bật/tắt bảo trì */
  @Post('toggle')
  @UseGuards(AuthGuard)
  async toggle(
    @Req() req: any,
    @Headers('x-tenant-id') xTenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { enabled: boolean; note?: string; durationMinutes?: number },
  ) {
    if (user.staffType !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Chỉ SUPER_ADMIN mới có quyền bật/tắt bảo trì');
    }

    const tenantId = xTenantId || getTenantIdFromRequest(req);

    if (body.enabled) {
      return this.maintenanceService.enable(
        tenantId,
        body.note || '',
        body.durationMinutes ?? null,
      );
    } else {
      return this.maintenanceService.disable(tenantId);
    }
  }
}
