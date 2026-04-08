import { Module } from '@nestjs/common';
import { MenuCampaignController } from './menu-campaign.controller';
import { MenuCampaignService } from './menu-campaign.service';
import { CampaignEngineService } from './campaign-engine.service';
import { MenuCampaignGateway } from './menu-campaign.gateway';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MenuCampaignController],
  providers: [MenuCampaignService, CampaignEngineService, MenuCampaignGateway],
  exports: [MenuCampaignService, CampaignEngineService, MenuCampaignGateway],
})
export class MenuCampaignModule {}
