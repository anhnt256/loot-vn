import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
import { getTenantIdFromRequest } from '../hr-app/tenant-from-request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return res.json({ success: true, data: tenantInfo });
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
  async getMe(@Req() req: any) {
    return req.user;
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    return res.json({ success: true });
  }
}
