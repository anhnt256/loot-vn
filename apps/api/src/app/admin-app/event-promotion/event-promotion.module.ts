import { Module } from '@nestjs/common';
import { EventPromotionController } from './event-promotion.controller';
import { EventPromotionService } from './event-promotion.service';
import { CouponService } from './coupon.service';
import { EventAnalyticsService } from './event-analytics.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EventPromotionController],
  providers: [EventPromotionService, CouponService, EventAnalyticsService],
  exports: [EventPromotionService, CouponService],
})
export class EventPromotionModule {}
