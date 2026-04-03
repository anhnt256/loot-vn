import { Controller, Post, Body, Headers, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('feedback')
@UseGuards(AuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Req() req: any,
    @Body()
    dto: {
      type: string;
      title: string;
      description: string;
      priority?: string;
      category?: string;
      note?: string;
      itemId?: number;
      isAnonymous?: boolean;
    },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const userId = Number(req.user?.userId ?? 0);
    const computerId = req.user?.computerId ? Number(req.user.computerId) : undefined;
    return this.feedbackService.create(tenantId, userId, { ...dto, computerId });
  }
}
