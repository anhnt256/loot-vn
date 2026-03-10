import { Module } from '@nestjs/common';
import { CheckInResultsController } from './check-in-results.controller';
import { CheckInResultsService } from './check-in-results.service';

@Module({
  controllers: [CheckInResultsController],
  providers: [CheckInResultsService],
})
export class CheckInResultsModule {}
