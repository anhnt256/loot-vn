import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { redisService } from '../../lib/redis-service';
import { ChatService, ChatMessageWithUser } from './chat.service';
import { validateMessage } from '../../lib/chat-validation';
import { messageRateLimit } from '../../lib/chat-rate-limit';

const REDIS_CHANNEL_CHAT = (tenantId: string) => `${tenantId}:chat:message`;
const ONLINE_KEY = (tenantId: string) => `${tenantId}:chat:online`;

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit() {
    this.subscribeRedis();
  }

  private subscribeRedis(attempt = 1) {
    redisService
      .psubscribe('*:chat:message', (channel, message) => {
        const tenantId = channel.split(':chat:message')[0];
        this.server.to(`chat:${tenantId}`).emit('chat:message', message);
      })
      .then(() => {
        console.log('Redis chat psubscribe OK');
      })
      .catch((err) => {
        const delay = Math.min(attempt * 1000, 10000);
        console.error(`Redis psubscribe failed (attempt ${attempt}), retrying in ${delay}ms:`, err.message);
        setTimeout(() => this.subscribeRedis(attempt + 1), delay);
      });
  }

  async handleConnection(client: Socket) {
    const tenantId = client.handshake.auth?.tenantId as string;
    if (!tenantId) {
      client.disconnect();
      return;
    }

    client.data.tenantId = tenantId;
    client.data.userId = client.handshake.auth?.userId;
    client.data.machineName = client.handshake.auth?.machineName;
    client.data.staffId = client.handshake.auth?.staffId;
    client.data.loginType = client.handshake.auth?.loginType;

    // Join chat room for this tenant
    client.join(`chat:${tenantId}`);

    // Track online users
    const identifier =
      client.data.machineName || `user:${client.data.userId}` || client.id;
    await redisService.sadd(ONLINE_KEY(tenantId), identifier);

    // Broadcast online count
    await this.broadcastOnlineCount(tenantId);

    // Send unread count to this client
    if (client.data.userId) {
      const count = await this.chatService.getUnreadCount(
        tenantId,
        client.data.userId,
      );
      client.emit('chat:unread_count', { count });
    }
  }

  async handleDisconnect(client: Socket) {
    const tenantId = client.data?.tenantId;
    if (!tenantId) return;

    const identifier =
      client.data.machineName || `user:${client.data.userId}` || client.id;
    await redisService.srem(ONLINE_KEY(tenantId), identifier);

    // Broadcast updated online count
    await this.broadcastOnlineCount(tenantId);
  }

  /** Client gửi mark-seen qua socket */
  @SubscribeMessage('chat:mark-seen')
  async handleMarkSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number },
  ) {
    const tenantId = client.data.tenantId;
    const userId = client.data.userId;
    if (!tenantId || !userId || !data?.messageId) return;
    await this.chatService.markSeen(tenantId, userId, data.messageId);
    const count = await this.chatService.getUnreadCount(tenantId, userId);
    client.emit('chat:unread_count', { count });
  }

  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      content: string;
      machineName?: string;
      userId?: number;
      staffId?: number;
    },
  ) {
    const tenantId = client.data.tenantId;
    if (!tenantId) return { error: 'Not authenticated' };

    // Validate message
    const validation = validateMessage(data.content || '');
    if (!validation.isValid) {
      return { error: validation.errors[0] };
    }

    // Rate limit
    const identifier = client.data.machineName || client.id;
    const rateCheck = await messageRateLimit.checkLimit(
      `${tenantId}:${identifier}`,
    );
    if (!rateCheck.allowed) {
      return { error: 'Gửi tin nhắn quá nhanh, vui lòng chờ' };
    }

    try {
      const message = await this.chatService.saveMessage(tenantId, {
        content: data.content,
        machineName:
          data.machineName || client.data.machineName || 'Unknown',
        userId: data.userId ?? client.data.userId,
        staffId: data.staffId ?? client.data.staffId,
      });

      // Publish qua Redis → broadcast tới tất cả clients
      await redisService.publish(REDIS_CHANNEL_CHAT(tenantId), message);

      return { success: true, message };
    } catch (error) {
      console.error('Error sending chat message:', error);
      return { error: 'Gửi tin nhắn thất bại' };
    }
  }

  private async broadcastOnlineCount(tenantId: string) {
    const count = await redisService.scard(ONLINE_KEY(tenantId));
    this.server
      .to(`chat:${tenantId}`)
      .emit('chat:online_count', { count });
  }

  /** Helper: broadcast message from controller (REST API fallback) */
  async publishMessage(tenantId: string, message: ChatMessageWithUser) {
    await redisService.publish(REDIS_CHANNEL_CHAT(tenantId), message);
  }
}
