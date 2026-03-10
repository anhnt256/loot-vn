import { Controller, Post, Body } from '@nestjs/common';
import { UserRewardMapService } from './user-reward-map.service';

@Controller('user-reward-map')
export class UserRewardMapController {
  constructor(private readonly userRewardMapService: UserRewardMapService) {}

  @Post('create')
  async create(
    @Body()
    dto: {
      userId: number;
      rewardId: number;
      duration?: number;
      isUsed?: boolean;
      value?: number;
      oldStars: number;
      newStars: number;
      branch: string;
      token: string;
    },
  ) {
    return this.userRewardMapService.create(dto);
  }
}
