import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RevenueReportsService } from './revenue-reports.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('revenue-reports')
export class RevenueReportsController {
  constructor(private readonly revenueReportsService: RevenueReportsService) {}

  @Post('generate')
  @UseGuards(AuthGuard)
  async generate(@Body() body: any, @Req() req: any) {
    const branch = body.branch || req.headers['x-branch'] || 'GoVap';
    const results = await this.revenueReportsService.generate(
      branch,
      body.date,
    );
    return { success: true, results };
  }

  @Get('verify-ffood')
  @UseGuards(AuthGuard)
  async verifyFfood(
    @Query('reportDate') reportDate: string,
    @Query('branch') queryBranch: string,
    @Req() req: any,
  ) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    const data = await this.revenueReportsService.verifyFfood(
      branch,
      reportDate,
    );
    return { success: true, data };
  }

  @Get('verify-fnet')
  @UseGuards(AuthGuard)
  async verifyFnet(
    @Query('date') date: string,
    @Query('branch') queryBranch: string,
    @Req() req: any,
  ) {
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    const data = await this.revenueReportsService.verifyFnet(branch, date);
    return { success: true, data };
  }
}
