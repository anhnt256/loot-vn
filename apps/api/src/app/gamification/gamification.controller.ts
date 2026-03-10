import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { GamesService } from './games.service';
import { MissionsService } from './missions.service';
import { BattlePassService } from './battle-pass.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('gamification')
@UseGuards(AuthGuard)
export class GamificationController {
  constructor(
    private readonly rewardsService: RewardsService,
    private readonly gamesService: GamesService,
    private readonly missionsService: MissionsService,
    private readonly battlePassService: BattlePassService,
  ) {}

  // Rewards
  @Get('rewards/pending')
  async getPendingRewards(@Req() req: any, @Query('userId') userId?: string) {
    const branch = req.user.branch;
    return this.rewardsService.findPending(
      branch,
      userId ? parseInt(userId) : undefined,
    );
  }

  @Post('rewards/approve')
  async approveReward(@Req() req: any, @Body() body: any) {
    const { rewardMapId, action, note } = body;
    const branch = req.user.branch;
    return this.rewardsService.approve(rewardMapId, branch, action, note);
  }

  // Games
  @Get('games/results')
  async getGameResults(@Req() req: any) {
    const branch = req.user.branch;
    return this.gamesService.findAllResults(branch);
  }

  @Get('rankings')
  async getRankings(@Req() req: any, @Query('type') type?: 'STARS' | 'GAMES') {
    const branch = req.user.branch;
    return this.gamesService.getRankings(branch, type);
  }

  // Missions
  @Get('missions')
  async getMissions(@Req() req: any) {
    const userId = req.user.userId;
    const branch = req.user.branch;
    return this.missionsService.findAll(userId, branch);
  }

  // Battle Pass
  @Get('battle-pass/current-season')
  async getCurrentSeason() {
    return this.battlePassService.getCurrentSeason();
  }

  @Post('battle-pass/sync-progress')
  async syncBattlePass(@Req() req: any) {
    const userId = req.user.userId;
    const branch = req.user.branch;
    return this.battlePassService.syncProgress(userId, branch);
  }
}
