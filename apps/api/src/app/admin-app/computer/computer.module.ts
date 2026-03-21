import { Module } from '@nestjs/common';
import { ComputerController } from './computer.controller';
import { ComputerService } from './computer.service';
import { DatabaseModule } from '../../database/database.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [ComputerController],
  providers: [ComputerService],
  exports: [ComputerService],
})
export class ComputerModule {}
