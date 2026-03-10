import { Module } from '@nestjs/common';
import { PromotionCodesController } from './promotion-codes.controller';
import { PromotionCodesService } from './promotion-codes.service';

@Module({
  controllers: [PromotionCodesController],
  providers: [PromotionCodesService],
})
export class PromotionCodesModule {}
