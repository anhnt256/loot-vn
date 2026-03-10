import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Req() req: any, @Query() query: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const limit = parseInt(query.limit || '20', 10);
    const offset = parseInt(query.offset || '0', 10);
    const data = await this.eventsService.findAll(branch, { limit, offset });
    return { success: true, ...data };
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Req() req: any, @Body() body: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const event = await this.eventsService.create(branch, body);
    return { success: true, event };
  }
}
