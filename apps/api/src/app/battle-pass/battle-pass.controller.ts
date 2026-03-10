import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { BattlePassService } from './battle-pass.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('battle-pass')
export class BattlePassController {
  constructor(private readonly battlePassService: BattlePassService) {}

  @Get('progress')
  @UseGuards(AuthGuard)
  async getProgress(@Req() req: any, @Query('branch') queryBranch: string) {
    const userId = Number(req.user.userId);
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.battlePassService.getProgress(userId, branch);
  }

  @Post('sync-progress')
  @UseGuards(AuthGuard)
  async syncProgress(@Req() req: any, @Query('branch') queryBranch: string) {
    const userId = Number(req.user.userId);
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.battlePassService.syncProgress(userId, branch);
  }

  @Post('update-progress')
  @UseGuards(AuthGuard)
  async updateProgress(
    @Req() req: any,
    @Body() body: any,
    @Query('branch') queryBranch: string,
  ) {
    const userId = Number(req.user.userId);
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.battlePassService.updateProgress(
      userId,
      branch,
      body.experience,
      body.totalSpent,
    );
  }

  @Post('update-spending')
  @UseGuards(AuthGuard)
  async updateSpending(@Req() req: any, @Query('branch') queryBranch: string) {
    const userId = Number(req.user.userId);
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.battlePassService.updateSpending(userId, branch);
  }

  @Post('claim-reward/:rewardId')
  @UseGuards(AuthGuard)
  async claimReward(
    @Req() req: any,
    @Param('rewardId') rewardId: string,
    @Query('branch') queryBranch: string,
  ) {
    const userId = Number(req.user.userId);
    const branch = queryBranch || req.headers['x-branch'] || 'GoVap';
    return this.battlePassService.claimReward(userId, branch, Number(rewardId));
  }
}
