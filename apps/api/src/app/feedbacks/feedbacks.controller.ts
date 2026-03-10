import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';

export class CreateFeedbackDto {
  userId: string;
  branch: string;
  type: string;
  title: string;
  description: string;
  priority: string;
}

export class AddFeedbackResponseDto {
  feedbackId: number;
  branch: string;
  response: string;
}

export class UpdateFeedbackStatusDto {
  feedbackId: number;
  branch: string;
  status: string;
  stars?: number;
}

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  async create(@Body() dto: CreateFeedbackDto) {
    return this.feedbacksService.createFeedback(
      dto.userId,
      dto.branch,
      dto.type,
      dto.title,
      dto.description,
      dto.priority,
    );
  }

  @Post('response')
  async addResponse(@Body() dto: AddFeedbackResponseDto) {
    return this.feedbacksService.addFeedbackResponse(
      dto.feedbackId,
      dto.branch,
      dto.response,
    );
  }

  @Put('status')
  async updateStatus(@Body() dto: UpdateFeedbackStatusDto) {
    return this.feedbacksService.updateFeedbackStatus(
      dto.feedbackId,
      dto.branch,
      dto.status,
      dto.stars,
    );
  }
}
