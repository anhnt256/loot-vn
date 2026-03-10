import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { FraudService } from './fraud.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('security')
@UseGuards(AuthGuard)
export class SecurityController {
  constructor(private readonly fraudService: FraudService) {}

  @Get('fraud-login-alerts')
  async getLoginAlerts(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branch = req.user.branch;
    return this.fraudService.getLoginAlerts(branch, from, to);
  }

  @Get('revenue-alerts')
  async getRevenueAlerts(
    @Req() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const branch = req.user.branch;
    const now = new Date();
    return this.fraudService.getRevenueAlerts(
      branch,
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1,
    );
  }
}
