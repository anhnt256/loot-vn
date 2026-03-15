import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Req() req: any, @Res() res: Response) {
    const result: any = await this.authService.login(body);

    if (result.requirePasswordReset) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Vui lòng đặt mật khẩu mới',
        data: result,
      });
    }

    const isAdmin = result.role === 'admin' || result.isAdmin === true;
    const tokenCookieName = isAdmin ? 'token' : 'staffToken';

    res.cookie(tokenCookieName, result.token, {
      maxAge: 86400 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    if (result.loginType) {
      res.cookie('loginType', result.loginType, {
        maxAge: 86400 * 1000,
        path: '/',
      });
    }

    return res.json({
      ...result,
      success: true,
      statusCode: 200,
      message: 'Login Success',
    });
  }

  @Post('logout')
  async logout(@Req() req: any, @Res() res: Response) {
    const referer = req.headers['referer'] || '';
    const token = req.cookies['token'];
    const staffToken = req.cookies['staffToken'];
    const loginType = req.cookies['loginType'];

    const isAdminLogout =
      referer.includes('/admin') ||
      (token && !staffToken) ||
      (token && staffToken && referer.includes('/admin'));
    const isStaffLogout =
      referer.includes('/staff') ||
      (staffToken && !token) ||
      (token && staffToken && referer.includes('/staff'));

    if (isAdminLogout) {
      res.clearCookie('token');
      if (loginType === 'username') {
        res.clearCookie('loginType');
      }
    } else if (isStaffLogout) {
      res.clearCookie('staffToken');
      if (loginType === 'account') {
        res.clearCookie('loginType');
      }
    } else {
      res.clearCookie('token');
      res.clearCookie('staffToken');
      res.clearCookie('loginType');
    }

    return res.json({ success: true });
  }
}
