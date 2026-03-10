import { Module } from '@nestjs/common';
import { FraudService } from './fraud.service';
import { SecurityController } from './security.controller';

@Module({
  controllers: [SecurityController],
  providers: [FraudService],
  exports: [FraudService],
})
export class SecurityModule {}
