import { Module } from '@nestjs/common';
import { UserRewardMapController } from './user-reward-map.controller';
import { UserRewardMapService } from './user-reward-map.service';

@Module({
  controllers: [UserRewardMapController],
  providers: [UserRewardMapService],
})
export class UserRewardMapModule {}
