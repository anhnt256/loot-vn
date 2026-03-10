import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MomoService } from './momo.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}

  @Get('token')
  @UseGuards(AuthGuard)
  async getToken(@Query('branch') queryBranch: string, @Req() req: any) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.momoService.getToken(branch);
  }

  @Post('token/refresh')
  @UseGuards(AuthGuard)
  async refreshToken(@Query('branch') queryBranch: string, @Req() req: any) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.momoService.getToken(branch, true);
  }

  @Get('report/fetch')
  @UseGuards(AuthGuard)
  async fetchReport(@Query('branch') queryBranch: string, @Req() req: any) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    const result = await this.momoService.fetchReport(branch);
    return { success: true, ...result };
  }
}
