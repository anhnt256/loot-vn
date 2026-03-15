import { Module } from '@nestjs/common';
import { HrAppController } from './hr-app.controller';
import { HrAppService } from './hr-app.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HrAppController],
  providers: [HrAppService],
})
export class HrAppModule {}
