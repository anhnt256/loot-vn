import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { validateMessage } from '../../lib/chat-validation';

@Controller()
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  /** GET /admin/chat/messages — lấy tin nhắn chat (admin) */
  @Get('admin/chat/messages')
  async getMessagesAdmin(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is missing');
    const result = await this.chatService.getMessages(tenantId, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '50', 10),
    });
    return { statusCode: 200, data: result };
  }

  /** POST /admin/chat/send — admin gửi tin nhắn */
  @Post('admin/chat/send')
  async sendMessageAdmin(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { content: string; machineName?: string },
  ) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is missing');
    if (!body.content?.trim())
      throw new BadRequestException('Nội dung tin nhắn không được trống');

    const validation = validateMessage(body.content);
    if (!validation.isValid)
      throw new BadRequestException(validation.errors[0]);

    const message = await this.chatService.saveMessage(tenantId, {
      content: body.content,
      machineName: body.machineName || user.fullName || user.userName || 'ADMIN',
      userId: user.userId,
      staffId: user.staffId,
    });

    await this.chatGateway.publishMessage(tenantId, message);
    return { statusCode: 200, data: message };
  }

  /** GET /admin/chat/last-seen — lấy lastSeenId của admin */
  @Get('admin/chat/last-seen')
  async getLastSeen(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is missing');
    const lastSeenId = await this.chatService.getLastSeenId(tenantId, user.userId);
    return { statusCode: 200, data: { lastSeenId } };
  }

  /** GET /admin/chat/unread-count — số tin nhắn chưa đọc */
  @Get('admin/chat/unread-count')
  async getUnreadCount(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is missing');
    const count = await this.chatService.getUnreadCount(tenantId, user.userId);
    return { statusCode: 200, data: { count } };
  }

  /** POST /admin/chat/mark-seen — đánh dấu đã đọc đến messageId */
  @Post('admin/chat/mark-seen')
  async markSeen(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { messageId: number },
  ) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is missing');
    if (!body.messageId)
      throw new BadRequestException('messageId is required');
    await this.chatService.markSeen(tenantId, user.userId, body.messageId);
    const count = await this.chatService.getUnreadCount(tenantId, user.userId);
    return { statusCode: 200, data: { count } };
  }

  /** GET /dashboard/chat/messages — lấy tin nhắn chat (client) */
  @Get('dashboard/chat/messages')
  async getMessagesClient(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is missing');
    const result = await this.chatService.getMessages(tenantId, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '50', 10),
    });
    return { statusCode: 200, data: result };
  }

  /** POST /dashboard/chat/send — client gửi tin nhắn */
  @Post('dashboard/chat/send')
  async sendMessageClient(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { content: string },
  ) {
    if (!tenantId)
      throw new BadRequestException('x-tenant-id header is missing');
    if (!body.content?.trim())
      throw new BadRequestException('Nội dung tin nhắn không được trống');

    const validation = validateMessage(body.content);
    if (!validation.isValid)
      throw new BadRequestException(validation.errors[0]);

    const message = await this.chatService.saveMessage(tenantId, {
      content: body.content,
      machineName: user.computerName || user.macAddress || 'Unknown',
      userId: user.userId,
    });

    await this.chatGateway.publishMessage(tenantId, message);
    return { statusCode: 200, data: message };
  }
}
