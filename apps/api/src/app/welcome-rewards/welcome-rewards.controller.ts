import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { WelcomeRewardsService } from './welcome-rewards.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('welcome-rewards')
@UseGuards(AuthGuard)
export class WelcomeRewardsController {
  constructor(private readonly welcomeRewardsService: WelcomeRewardsService) {}

  @Get()
  async getStatus(@Req() req: any) {
    return this.welcomeRewardsService.getStatus(
      req.user.userId,
      req.user.branch,
    );
  }
}
