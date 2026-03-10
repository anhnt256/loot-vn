import { Injectable, Logger } from '@nestjs/common';
import { getUserNotifications } from '../lib/game-appointment-notifications';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async findAll(userId: number, limit = 20, offset = 0) {
    try {
      const notifications = await getUserNotifications(userId, limit, offset);
      return {
        notifications,
        pagination: {
          limit,
          offset,
          hasMore: notifications.length === limit,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error fetching notifications for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
