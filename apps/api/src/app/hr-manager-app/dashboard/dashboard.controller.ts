import { Controller, Get, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../../auth/auth.guard';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('hr-manager/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id or invalid Origin/Referer');
    return id;
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  async getStats(@Req() req: any) {
    return this.dashboardService.getStats(this.getTenantId(req));
  }
}
