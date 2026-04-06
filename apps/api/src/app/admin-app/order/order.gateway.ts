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

const REDIS_CHANNEL_NEW_ORDER = (tenantId: string) => `${tenantId}:orders:new`;
const REDIS_CHANNEL_ORDER_STATUS = (tenantId: string, orderId: number) =>
  `${tenantId}:order:status:${orderId}`;

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/orders',
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    // Subscribe Redis pattern để forward event tới đúng Socket.IO room
    // Pattern: *:orders:new  và  *:order:status:*
    redisService.psubscribe('*:orders:new', (channel, message) => {
      // channel = "{tenantId}:orders:new"
      const tenantId = channel.split(':orders:new')[0];
      this.server.to(`admin:${tenantId}`).emit('order:new', message);
    }).catch(console.error);

    redisService.psubscribe('*:order:status:*', (channel, message) => {
      // channel = "{tenantId}:order:status:{orderId}"
      const parts = channel.split(':order:status:');
      const orderId = Number(parts[1]);
      if (orderId) {
        this.server.to(`order:${orderId}`).emit('order:status', message);
      }
    }).catch(console.error);
  }

  handleConnection(client: Socket) {
    // tenantId được gửi kèm khi connect: socket.auth = { tenantId }
    const tenantId = client.handshake.auth?.tenantId as string;
    if (tenantId) {
      client.data.tenantId = tenantId;
      // Auto-join tenant room để nhận broadcast pause/resume
      client.join(`tenant:${tenantId}`);
    }
  }

  handleDisconnect(_client: Socket) {
    // cleanup tự động khi disconnect
  }

  /** Admin join vào room để nhận thông báo đơn mới */
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

  /** Client join vào room của đơn hàng cụ thể để nhận status update */
  @SubscribeMessage('join:order')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: number },
  ) {
    if (data?.orderId) {
      client.join(`order:${data.orderId}`);
      return { joined: `order:${data.orderId}` };
    }
  }

  // ── Helpers được gọi từ Controller ──────────────────────────────────────

  /** Publish new order event qua Redis → forward tới admin room */
  async publishNewOrder(tenantId: string, order: any) {
    await redisService.publish(REDIS_CHANNEL_NEW_ORDER(tenantId), order);
  }

  /** Publish status update qua Redis → forward tới client room của đơn */
  async publishOrderStatus(tenantId: string, orderId: number, payload: any) {
    await redisService.publish(
      REDIS_CHANNEL_ORDER_STATUS(tenantId, orderId),
      payload,
    );
  }

  /** Broadcast pause event trực tiếp tới tất cả client của tenant */
  broadcastPause(tenantId: string, payload: { resumeAt: string; note: string | null }) {
    this.server.to(`tenant:${tenantId}`).emit('order:pause', payload);
  }

  /** Broadcast resume event tới tất cả client của tenant */
  broadcastResume(tenantId: string) {
    this.server.to(`tenant:${tenantId}`).emit('order:resume', {});
  }

  /** Broadcast shift start event tới tất cả client */
  broadcastShiftStart(tenantId: string) {
    this.server.to(`tenant:${tenantId}`).emit('shift:start', {});
  }

  /** Broadcast shift end event tới tất cả client */
  broadcastShiftEnd(tenantId: string) {
    this.server.to(`tenant:${tenantId}`).emit('shift:end', {});
  }

  /** Broadcast menu updated event khi tồn kho thay đổi */
  broadcastMenuUpdate(tenantId: string) {
    this.server.to(`tenant:${tenantId}`).emit('menu:updated', {});
  }
}
