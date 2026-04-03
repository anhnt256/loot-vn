import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
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

    res.cookie('token', result.token, {
      maxAge: 86400 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.json({
      ...result,
      success: true,
      statusCode: 200,
      message: 'Login Success',
    });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('token', { path: '/' });
    return res.json({ success: true });
  }
}
