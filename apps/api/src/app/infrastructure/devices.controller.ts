import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query('computerId') computerId: string) {
    return this.devicesService.findAll(
      computerId ? parseInt(computerId, 10) : undefined,
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body('computerId', ParseIntPipe) computerId: number) {
    return this.devicesService.create(computerId);
  }
}
