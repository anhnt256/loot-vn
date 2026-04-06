import { Injectable } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { sanitizeMessage } from '../../lib/chat-validation';
import { redisService } from '../../lib/redis-service';

const LAST_SEEN_KEY = (tenantId: string, userId: number) =>
  `${tenantId}:chat:lastSeen:${userId}`;

export interface ChatMessageData {
  content: string;
  userId?: number;
  machineName: string;
  staffId?: number;
}

export interface ChatMessageWithUser {
  id: number;
  content: string;
  userId: number | null;
  machineName: string;
  createdAt: string;
  staffId: number | null;
  userName: string | null;
  staffType: string | null;
}

@Injectable()
export class ChatService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async saveMessage(
    tenantId: string,
    data: ChatMessageData,
  ): Promise<ChatMessageWithUser> {
    const db = await this.tenantGateway.getGatewayClient(tenantId);
    const content = sanitizeMessage(data.content);

    const result = await (db as any).chatMessage.create({
      data: {
        content,
        userId: data.userId ?? null,
        machineName: data.machineName,
        staffId: data.staffId ?? null,
      },
    });

    // machineName = sender display name (set at send time)
    // JOIN User for regular users, JOIN Staff for staffType only
    const messages = await (db as any).$queryRawUnsafe(
      `SELECT cm.id, cm.content, cm.userId, cm.machineName, cm.createdAt, cm.staffId,
              COALESCE(s.fullName, cm.machineName, u.userName) as userName,
              s.staffType
       FROM ChatMessage cm
       LEFT JOIN User u ON cm.userId = u.userId
       LEFT JOIN Staff s ON cm.staffId = s.id
       WHERE cm.id = ?`,
      result.id,
    );

    const msg = messages[0];
    return {
      id: Number(msg.id),
      content: msg.content,
      userId: msg.userId ? Number(msg.userId) : null,
      machineName: msg.machineName,
      createdAt: msg.createdAt,
      staffId: msg.staffId ? Number(msg.staffId) : null,
      userName: msg.userName ?? null,
      staffType: msg.staffType ?? null,
    };
  }

  async getMessages(
    tenantId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<{
    messages: ChatMessageWithUser[];
    total: number;
    hasNext: boolean;
  }> {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;
    const db = await this.tenantGateway.getGatewayClient(tenantId);

    const [messages, countResult] = await Promise.all([
      (db as any).$queryRawUnsafe(
        `SELECT cm.id, cm.content, cm.userId, cm.machineName, cm.createdAt, cm.staffId,
                COALESCE(s.fullName, cm.machineName, u.userName) as userName,
                s.staffType
         FROM ChatMessage cm
         LEFT JOIN User u ON cm.userId = u.userId
         LEFT JOIN Staff s ON cm.staffId = s.id
         ORDER BY cm.createdAt DESC
         LIMIT ? OFFSET ?`,
        limit,
        offset,
      ),
      (db as any).$queryRawUnsafe(
        `SELECT COUNT(*) as total FROM ChatMessage`,
      ),
    ]);

    const total = Number(countResult[0]?.total || 0);

    return {
      messages: (messages as any[]).reverse().map((m: any) => ({
        id: Number(m.id),
        content: m.content,
        userId: m.userId ? Number(m.userId) : null,
        machineName: m.machineName,
        createdAt: m.createdAt,
        staffId: m.staffId ? Number(m.staffId) : null,
        userName: m.userName ?? null,
        staffType: m.staffType ?? null,
      })),
      total,
      hasNext: offset + limit < total,
    };
  }

  async getLastSeenId(tenantId: string, userId: number): Promise<number> {
    const val = await redisService.get(LAST_SEEN_KEY(tenantId, userId));
    return val ? parseInt(val, 10) : 0;
  }

  async markSeen(tenantId: string, userId: number, messageId: number): Promise<void> {
    const current = await this.getLastSeenId(tenantId, userId);
    if (messageId > current) {
      await redisService.set(LAST_SEEN_KEY(tenantId, userId), messageId.toString());
    }
  }

  async getUnreadCount(tenantId: string, userId: number): Promise<number> {
    const lastSeenId = await this.getLastSeenId(tenantId, userId);
    const db = await this.tenantGateway.getGatewayClient(tenantId);
    const result = await (db as any).$queryRawUnsafe(
      `SELECT COUNT(*) as cnt FROM ChatMessage WHERE id > ?`,
      lastSeenId,
    );
    return Number(result[0]?.cnt || 0);
  }

  async getLatestMessageId(tenantId: string): Promise<number> {
    const db = await this.tenantGateway.getGatewayClient(tenantId);
    const result = await (db as any).$queryRawUnsafe(
      `SELECT MAX(id) as maxId FROM ChatMessage`,
    );
    return Number(result[0]?.maxId || 0);
  }
}
