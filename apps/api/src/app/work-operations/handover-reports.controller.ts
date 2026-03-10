import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HandoverReportsService } from './handover-reports.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('handover-reports')
export class HandoverReportsController {
  constructor(
    private readonly handoverReportsService: HandoverReportsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('date') date: string,
    @Query('reportType') reportType: string,
    @Req() req: any,
  ) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const data = await this.handoverReportsService.findAll(
      branch,
      date,
      reportType,
    );
    return { success: true, data };
  }

  @Post()
  @UseGuards(AuthGuard)
  async createOrUpdate(@Body() body: any, @Req() req: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const data = await this.handoverReportsService.createOrUpdate(branch, body);
    return { success: true, data };
  }

  @Get('check-completion')
  @UseGuards(AuthGuard)
  async checkCompletion(
    @Query('date') date: string,
    @Query('shift') shift: string,
    @Query('reportType') reportType: string,
    @Req() req: any,
  ) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const data = await this.handoverReportsService.checkCompletion(
      branch,
      date,
      shift,
      reportType,
    );
    return { success: true, data };
  }
}
