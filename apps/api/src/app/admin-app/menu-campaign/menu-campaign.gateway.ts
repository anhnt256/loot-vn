import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { redisService } from '../../lib/redis-service';

const CH_BUDGET = (t: string) => `${t}:mc:budget`;
const CH_STATUS = (t: string) => `${t}:mc:status`;
const CH_CHANGED = (t: string) => `${t}:mc:changed`;

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/menu-campaigns',
})
export class MenuCampaignGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    redisService.psubscribe('*:mc:budget', (channel, message) => {
      const tenantId = channel.split(':mc:budget')[0];
      this.server.to(`mc:${tenantId}`).emit('campaign:budget_updated', message);
    }).catch(console.error);

    redisService.psubscribe('*:mc:status', (channel, message) => {
      const tenantId = channel.split(':mc:status')[0];
      this.server.to(`mc:${tenantId}`).emit('campaign:status_changed', message);
    }).catch(console.error);

    // Campaign CRUD changes → clients refresh prices
    redisService.psubscribe('*:mc:changed', (channel, message) => {
      const tenantId = channel.split(':mc:changed')[0];
      this.server.to(`mc:${tenantId}`).emit('campaign:changed', message);
    }).catch(console.error);
  }

  handleConnection(client: Socket) {
    const tenantId = client.handshake.auth?.tenantId as string;
    if (tenantId) {
      client.data.tenantId = tenantId;
      client.join(`mc:${tenantId}`);
    }
  }

  handleDisconnect() {}

  @SubscribeMessage('join:campaign')
  handleJoinCampaign(@ConnectedSocket() client: Socket) {
    const tenantId = client.data.tenantId;
    if (tenantId) client.join(`mc:${tenantId}`);
  }

  async publishBudgetUpdate(tenantId: string, data: any) {
    await redisService.publish(CH_BUDGET(tenantId), data);
  }

  async publishStatusChange(tenantId: string, data: any) {
    await redisService.publish(CH_STATUS(tenantId), data);
  }

  /** Broadcast khi admin CRUD campaign → client refresh giá menu */
  async publishCampaignChanged(tenantId: string, action: string) {
    await redisService.publish(CH_CHANGED(tenantId), { action, timestamp: Date.now() });
  }
}
