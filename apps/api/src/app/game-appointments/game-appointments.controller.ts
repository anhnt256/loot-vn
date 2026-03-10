import { Controller, Post, Body } from '@nestjs/common';
import { GameAppointmentsService } from './game-appointments.service';
import {
  CreateGameAppointmentInput,
  JoinGameAppointmentInput,
  LeaveGameAppointmentInput,
  CompleteGameAppointmentInput,
} from './game-appointments.dto';

@Controller('game-appointments')
export class GameAppointmentsController {
  constructor(
    private readonly gameAppointmentsService: GameAppointmentsService,
  ) {}

  @Post('create')
  async create(
    @Body()
    dto: CreateGameAppointmentInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    return this.gameAppointmentsService.create(dto);
  }

  @Post('join')
  async join(
    @Body()
    dto: JoinGameAppointmentInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    return this.gameAppointmentsService.join(dto);
  }

  @Post('leave')
  async leave(
    @Body()
    dto: LeaveGameAppointmentInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    return this.gameAppointmentsService.leave(dto);
  }

  @Post('complete')
  async complete(
    @Body()
    dto: CompleteGameAppointmentInput & {
      userId: number;
      branch: string;
      token: string;
    },
  ) {
    return this.gameAppointmentsService.complete(dto);
  }
}
