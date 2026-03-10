import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('management/manager')
@UseGuards(AuthGuard)
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('bonuses')
  async findAllBonuses(
    @Req() req: any,
    @Query('staffId') staffId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const branch = req.user.branch;
    return this.managerService.findAllBonuses(
      branch,
      staffId ? parseInt(staffId) : undefined,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('bonuses')
  async createBonus(@Req() req: any, @Body() data: any) {
    const branch = req.user.branch;
    return this.managerService.createBonus(data, branch);
  }

  @Get('penalties')
  async findAllPenalties(
    @Req() req: any,
    @Query('staffId') staffId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const branch = req.user.branch;
    return this.managerService.findAllPenalties(
      branch,
      staffId ? parseInt(staffId) : undefined,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('penalties')
  async createPenalty(@Req() req: any, @Body() data: any) {
    const branch = req.user.branch;
    return this.managerService.createPenalty(data, branch);
  }

  @Get('transactions')
  async findAllTransactions(
    @Req() req: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const branch = req.user.branch;
    return this.managerService.findAllTransactions(
      branch,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('transactions')
  async createTransaction(@Req() req: any, @Body() data: any) {
    const branch = req.user.branch;
    const userId = req.user.userId;
    return this.managerService.createTransaction(data, branch, userId);
  }
}
