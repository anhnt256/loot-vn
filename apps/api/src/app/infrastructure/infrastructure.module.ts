import { Module } from '@nestjs/common';
import { ComputersController } from './computers.controller';
import { ComputersService } from './computers.service';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { MachineDetailsController } from './machine-details.controller';
import { MachineDetailsService } from './machine-details.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    ComputersController,
    DevicesController,
    MachineDetailsController,
  ],
  providers: [ComputersService, DevicesService, MachineDetailsService],
})
export class InfrastructureModule {}
