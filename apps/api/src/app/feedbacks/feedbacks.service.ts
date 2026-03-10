import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FeedbacksService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(
    userId: string,
    branch: string,
    type: string,
    title: string,
    description: string,
    priority: string,
  ) {
    try {
      const query = `
        INSERT INTO "Feedback" (
          "userId", "branch", "type", "title", "description", "priority", "status", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `;
      const params = [
        userId,
        branch,
        type,
        title,
        description,
        priority,
        'pending',
      ];
      await (this.prisma as any).$executeRawUnsafe(query, ...params);
      return { message: 'Feedback submitted successfully' };
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw new BadRequestException('Failed to submit feedback');
    }
  }

  async addFeedbackResponse(
    feedbackId: number,
    branch: string,
    response: string,
  ) {
    try {
      const feedback = await this.prisma.feedback.findFirst({
        where: { id: feedbackId, branch: branch },
        select: { id: true },
      });
      if (!feedback) throw new NotFoundException('Không tìm thấy phản ánh');

      await this.prisma.feedback.update({
        where: { id: feedbackId },
        data: { response: response, updatedAt: new Date() },
      });

      return { id: feedbackId, response: response, updatedAt: new Date() };
    } catch (error) {
      console.error('Error adding feedback response:', error);
      throw new BadRequestException('Có lỗi xảy ra khi thêm phản hồi');
    }
  }

  async updateFeedbackStatus(
    feedbackId: number,
    branch: string,
    status: string,
    stars?: number,
  ) {
    try {
      const feedback = await this.prisma.feedback.findFirst({
        where: { id: feedbackId, branch: branch },
        select: { userId: true, status: true, stars: true },
      });
      if (!feedback) throw new NotFoundException('Không tìm thấy phản ánh');

      const feedbackUpdateData: any = {
        status,
        stars: stars || 0,
        updatedAt: new Date(),
      };
      await this.prisma.feedback.update({
        where: { id: feedbackId },
        data: feedbackUpdateData,
      });

      if (status === 'COMPLETED' && stars && stars > 0 && feedback.userId) {
        const user = await this.prisma.user.findFirst({
          where: { id: feedback.userId, branch: branch },
          select: { stars: true },
        });
        if (user) {
          const newStars = user.stars + stars;
          await this.prisma.user.update({
            where: { id: feedback.userId, branch: branch },
            data: { stars: newStars },
          });

          await this.prisma.userStarHistory.create({
            data: {
              userId: feedback.userId,
              oldStars: user.stars,
              newStars: newStars,
              type: 'FEEDBACK',
              targetId: feedbackId,
              branch: branch,
              createdAt: new Date(),
            },
          });
        }
      }

      return {
        id: feedbackId,
        status: status,
        stars: stars,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw new BadRequestException('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  }
}
