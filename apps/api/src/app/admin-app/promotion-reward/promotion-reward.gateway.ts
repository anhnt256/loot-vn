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

const REDIS_CH_NEW = (tenantId: string) => `${tenantId}:redemption:new`;
const REDIS_CH_STATUS = (tenantId: string, id: number) => `${tenantId}:redemption:status:${id}`;

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/redemptions',
})
export class PromotionRewardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    // Forward Redis events → Socket.IO rooms
    redisService.psubscribe('*:redemption:new', (channel, message) => {
      const tenantId = channel.split(':redemption:new')[0];
      this.server.to(`admin:${tenantId}`).emit('redemption:new', message);
    }).catch(console.error);

    redisService.psubscribe('*:redemption:status:*', (channel, message) => {
      const parts = channel.split(':redemption:status:');
      const tenantId = channel.split(':redemption:')[0];
      const redemptionId = Number(parts[1]);
      // Notify admin room
      this.server.to(`admin:${tenantId}`).emit('redemption:status', message);
      // Notify user-specific room
      try {
        const data = typeof message === 'string' ? JSON.parse(message) : message;
        if (data?.userId) {
          this.server.to(`user:${tenantId}:${data.userId}`).emit('my-redemption:status', message);
        }
      } catch { /* ignore parse errors */ }
    }).catch(console.error);
  }

  handleConnection(client: Socket) {
    const tenantId = client.handshake.auth?.tenantId as string;
    if (tenantId) {
      client.data.tenantId = tenantId;
    }
  }

  handleDisconnect() { /* auto cleanup */ }

  /** Admin joins room to receive new redemption notifications */
  @SubscribeMessage('join:admin')
  handleJoinAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string },
  ) {
    const tenantId = data?.tenantId || client.data.tenantId;
    if (tenantId) {
      client.join(`admin:${tenantId}`);
      return { joined: `admin:${tenantId}` };
    }
  }

  /** User joins room to receive their redemption status updates */
  @SubscribeMessage('join:user')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    const tenantId = client.data.tenantId;
    if (tenantId && data?.userId) {
      client.join(`user:${tenantId}:${data.userId}`);
      return { joined: `user:${tenantId}:${data.userId}` };
    }
  }

  // ── Helpers called from controller/service ──

  /** New redemption request (user redeemed) → notify admin */
  async publishNewRedemption(tenantId: string, payload: any) {
    await redisService.publish(REDIS_CH_NEW(tenantId), payload);
  }

  /** Redemption status changed (approved/rejected) → notify admin + user */
  async publishRedemptionStatus(tenantId: string, redemptionId: number, payload: any) {
    await redisService.publish(REDIS_CH_STATUS(tenantId, redemptionId), payload);
  }
}
