import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TenantGatewayService } from '../../database/tenant-gateway.service';

@Module({
  providers: [ChatGateway, ChatService, TenantGatewayService],
  controllers: [ChatController],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
