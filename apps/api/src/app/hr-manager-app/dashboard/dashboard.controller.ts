import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('hr-manager/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(AuthGuard)
  async getStats() {
    return this.dashboardService.getStats();
  }
}
