import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  validatePagination,
  validateMachineName,
  validateChatMessage,
} from '../lib/chat-validation';
import { messageRateLimit, apiRateLimit } from '../lib/chat-rate-limit';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  @UseGuards(AuthGuard)
  async findAll(@Req() req: any, @Query() query: any) {
    const { page = '1', limit = '50', machineName, userId, staffId } = query;
    const branch = req.headers['x-branch'] || 'all';

    const pagination = validatePagination(page, limit);
    if (!pagination.isValid) throw new BadRequestException(pagination.errors);

    if (machineName && !validateMachineName(machineName).isValid) {
      throw new BadRequestException('Invalid machine name');
    }

    const rateLimit = await apiRateLimit.checkLimit(`messages:${branch}`);
    if (!rateLimit.allowed)
      throw new BadRequestException('Rate limit exceeded');

    const data = await this.chatService.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      userId: userId ? parseInt(userId, 10) : undefined,
      staffId: staffId ? parseInt(staffId, 10) : undefined,
    });

    return {
      statusCode: 200,
      message: 'Messages retrieved successfully',
      data,
    };
  }

  @Post('send')
  @UseGuards(AuthGuard)
  async sendMessage(@Req() req: any, @Body() body: any) {
    const { content, machineName, staffId } = body;
    const userId = req.user.userId;
    const branch = req.headers['x-branch'] || 'all';

    const validation = validateChatMessage({
      content,
      machineName,
      userId,
      staffId,
    });
    if (!validation.isValid) throw new BadRequestException(validation.errors);

    const rateLimitKey = `${userId || 'anonymous'}:${machineName || 'web'}`;
    const rateLimit = await messageRateLimit.checkLimit(rateLimitKey);
    if (!rateLimit.allowed)
      throw new BadRequestException('Rate limit exceeded');

    const data = await this.chatService.sendMessage(branch, {
      content,
      machineName,
      userId,
      staffId,
    });
    return { statusCode: 200, message: 'Message sent successfully', data };
  }
}
