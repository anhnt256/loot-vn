import { Module } from '@nestjs/common';
import { GameAppointmentsController } from './game-appointments.controller';
import { GameAppointmentsService } from './game-appointments.service';

@Module({
  controllers: [GameAppointmentsController],
  providers: [GameAppointmentsService],
})
export class GameAppointmentsModule {}
