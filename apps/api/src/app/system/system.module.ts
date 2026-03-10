import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController, ChatController, EventsController],
  providers: [NotificationsService, ChatService, EventsService],
})
export class SystemModule {}
