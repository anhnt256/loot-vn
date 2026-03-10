import { Module } from '@nestjs/common';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { TiersController } from './tiers.controller';
import { TiersService } from './tiers.service';
import { MomoController } from './momo.controller';
import { MomoService } from './momo.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VouchersController, TiersController, MomoController],
  providers: [VouchersService, TiersService, MomoService],
})
export class EconomyModule {}
