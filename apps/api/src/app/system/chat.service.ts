import { Injectable, Logger } from '@nestjs/common';
import {
  getChatMessages,
  saveChatMessage,
  getChatMessageById,
} from '../lib/chat-utils';
import { redisService } from '../lib/redis-service';
import { chatCache } from '../lib/chat-cache';
import { sanitizeMessage } from '../lib/chat-validation';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  async findAll(options: {
    page: number;
    limit: number;
    userId?: number;
    staffId?: number;
  }) {
    const result = await getChatMessages(null, options);
    const totalPages = Math.ceil(Number(result.total) / options.limit);

    return {
      messages: result.messages,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: Number(result.total),
        totalPages,
        hasNext: result.hasMore,
        hasPrev: options.page > 1,
      },
    };
  }

  async sendMessage(
    branch: string,
    data: {
      content: string;
      machineName?: string;
      userId?: number;
      staffId?: number;
    },
  ) {
    const sanitizedContent = sanitizeMessage(data.content);

    const messageId = await saveChatMessage({
      content: sanitizedContent,
      userId: data.userId,
      machineName: data.machineName,
      branch: branch || 'all',
      staffId: data.staffId,
    });

    const message = await getChatMessageById(messageId, branch || 'all');
    if (!message) throw new Error('Failed to create message');

    const messageData = {
      id: message.id,
      content: message.content,
      userId: message.userId,
      machineName: message.machineName,
      branch: message.branch,
      createdAt: message.createdAt,
      staffId: message.staffId,
      userName: message.userName,
    };

    // Publish to Redis for realtime
    await redisService.publish('chat:all', messageData);

    // Invalidate cache
    if (data.machineName) {
      await chatCache.invalidateMachineCache(data.machineName, branch || 'all');
    }

    return messageData;
  }
}
