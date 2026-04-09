import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser, UserRequestContext } from './user-request-context';
import { Response } from 'express';
import { getTenantIdFromRequest } from '../hr-app/tenant-from-request';
import { ConfigService } from '../admin-app/config/config.service';
import { TenantGatewayService } from '../database/tenant-gateway.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly tenantGateway: TenantGatewayService,
  ) {}

  @Get('tenant-info')
  async getTenantInfo(@Req() req: any, @Res() res: Response) {
    const tenantId = getTenantIdFromRequest(req);
    if (!tenantId) {
      return res.json({ success: false, message: 'Tenant ID not found' });
    }
    const tenantInfo = await this.authService.getTenantInfo(tenantId);
    if (!tenantInfo) {
      return res.json({ success: false, message: 'Tenant not found' });
    }
    // Attach game configs
    let spendPerRound = 30000;
    let upRateAmount = 500000;
    try {
      const configs = await this.configService.getConfigs(tenantId);
      spendPerRound = Number(configs['SPEND_PER_ROUND']) || 30000;
      upRateAmount = Number(configs['UP_RATE_AMOUNT']) || 500000;
    } catch {
      // keep defaults
    }
    // Fetch latest published regulation
    let latestRegulation = null;
    try {
      const gateway = await this.tenantGateway.getGatewayClient(tenantId);
      latestRegulation = await gateway.regulation.findFirst({
        where: { publishedAt: { not: null } },
        orderBy: { version: 'desc' },
        select: { id: true, version: true, title: true, content: true, publishedAt: true },
      });
    } catch {
      // Regulation table might not exist yet — skip
    }

    return res.json({ success: true, data: { ...tenantInfo, spendPerRound, upRateAmount, latestRegulation } });
  }

  @Post('login')
  async login(@Body() body: any, @Req() req: any, @Res() res: Response) {
    const tenantId = getTenantIdFromRequest(req) ?? undefined;
    const result: any = await this.authService.login(body, tenantId);

    if (result.requirePasswordReset) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Vui lòng đặt mật khẩu mới',
        data: result,
      });
    }

    return res.json({
      ...result,
      success: true,
      statusCode: 200,
      message: 'Login Success',
    });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: UserRequestContext) {
    return user;
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    return res.json({ success: true });
  }
}
