import { db } from '@/lib/db';

export interface NotificationData {
  type: 'APPOINTMENT_CREATED' | 'APPOINTMENT_JOINED' | 'APPOINTMENT_LEFT' | 'TIER_CHANGED' | 'APPOINTMENT_COMPLETED' | 'APPOINTMENT_CANCELLED';
  appointmentId: string;
  userId?: number;
  title: string;
  message: string;
  data?: any;
}

export interface TierChangeNotification {
  appointmentId: string;
  oldTier: string | null;
  newTier: string | null;
  promotion?: {
    promotion: string;
    description: string;
    businessLogic: string;
    minNetProfit: number;
  };
  memberCount: number;
  reason: string;
}

/**
 * Send notification to specific user
 */
export async function sendNotificationToUser(
  userId: number,
  notification: NotificationData
): Promise<void> {
  try {
    // Store notification in database (you might have a notifications table)
    console.log(`📧 Notification to User ${userId}:`, {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      appointmentId: notification.appointmentId,
      timestamp: new Date().toISOString()
    });

    // Here you would integrate with your notification system:
    // - Push notifications
    // - Email notifications
    // - SMS notifications
    // - In-app notifications
    // - WebSocket real-time updates

    // Example: Store in a notifications table
    // await prisma.notification.create({
    //   data: {
    //     userId,
    //     type: notification.type,
    //     title: notification.title,
    //     message: notification.message,
    //     appointmentId: notification.appointmentId,
    //     data: notification.data,
    //     isRead: false,
    //     createdAt: new Date()
    //   }
    // });

  } catch (error) {
    console.error('Error sending notification to user:', error);
  }
}

/**
 * Send notification to all members of an appointment
 */
export async function sendNotificationToAppointmentMembers(
  appointmentId: string,
  notification: Omit<NotificationData, 'userId'>
): Promise<void> {
  try {
    const appointment = await db.gameAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        members: {
          where: { status: 'JOINED' }
        }
      }
    });

    if (!appointment) {
      console.error('Appointment not found for notification:', appointmentId);
      return;
    }

    // Send notification to all active members
    for (const member of appointment.members) {
      await sendNotificationToUser(member.userId, {
        ...notification,
        userId: member.userId
      });
    }

    console.log(`📢 Notification sent to ${appointment.members.length} members of appointment ${appointmentId}`);

  } catch (error) {
    console.error('Error sending notification to appointment members:', error);
  }
}

/**
 * Handle appointment created notification
 */
export async function notifyAppointmentCreated(
  appointmentId: string,
  creatorId: number,
  appointmentData: {
    title: string;
    game: string;
    startTime: Date;
    tier?: string;
    promotion?: any;
  }
): Promise<void> {
  const notification: NotificationData = {
    type: 'APPOINTMENT_CREATED',
    appointmentId,
    userId: creatorId,
    title: 'Hẹn chơi đã được tạo thành công!',
    message: `Hẹn chơi "${appointmentData.title}" cho game ${appointmentData.game} đã được tạo thành công.`,
    data: {
      appointmentTitle: appointmentData.title,
      game: appointmentData.game,
      startTime: appointmentData.startTime,
      tier: appointmentData.tier,
      promotion: appointmentData.promotion
    }
  };

  await sendNotificationToUser(creatorId, notification);
}

/**
 * Handle user joined appointment notification
 */
export async function notifyUserJoined(
  appointmentId: string,
  userId: number,
  appointmentData: {
    title: string;
    game: string;
    currentMembers: number;
    maxMembers: number;
    tier?: string;
  }
): Promise<void> {
  // Notify the user who joined
  const userNotification: NotificationData = {
    type: 'APPOINTMENT_JOINED',
    appointmentId,
    userId,
    title: 'Tham gia hẹn chơi thành công!',
    message: `Bạn đã tham gia hẹn chơi "${appointmentData.title}" cho game ${appointmentData.game}.`,
    data: {
      appointmentTitle: appointmentData.title,
      game: appointmentData.game,
      currentMembers: appointmentData.currentMembers,
      maxMembers: appointmentData.maxMembers,
      tier: appointmentData.tier
    }
  };

  await sendNotificationToUser(userId, userNotification);

  // Notify other members about new member
  const memberNotification: NotificationData = {
    type: 'APPOINTMENT_JOINED',
    appointmentId,
    title: 'Có thành viên mới tham gia!',
    message: `Có thành viên mới tham gia hẹn chơi "${appointmentData.title}". Hiện tại có ${appointmentData.currentMembers}/${appointmentData.maxMembers} thành viên.`,
    data: {
      appointmentTitle: appointmentData.title,
      game: appointmentData.game,
      currentMembers: appointmentData.currentMembers,
      maxMembers: appointmentData.maxMembers,
      newMemberId: userId
    }
  };

  await sendNotificationToAppointmentMembers(appointmentId, memberNotification);
}

/**
 * Handle user left appointment notification
 */
export async function notifyUserLeft(
  appointmentId: string,
  userId: number,
  appointmentData: {
    title: string;
    game: string;
    currentMembers: number;
    maxMembers: number;
    tier?: string;
  }
): Promise<void> {
  // Notify the user who left
  const userNotification: NotificationData = {
    type: 'APPOINTMENT_LEFT',
    appointmentId,
    userId,
    title: 'Rời hẹn chơi thành công!',
    message: `Bạn đã rời hẹn chơi "${appointmentData.title}" cho game ${appointmentData.game}.`,
    data: {
      appointmentTitle: appointmentData.title,
      game: appointmentData.game,
      currentMembers: appointmentData.currentMembers,
      maxMembers: appointmentData.maxMembers,
      tier: appointmentData.tier
    }
  };

  await sendNotificationToUser(userId, userNotification);

  // Notify other members about member leaving
  const memberNotification: NotificationData = {
    type: 'APPOINTMENT_LEFT',
    appointmentId,
    title: 'Có thành viên rời hẹn chơi!',
    message: `Có thành viên rời hẹn chơi "${appointmentData.title}". Hiện tại còn ${appointmentData.currentMembers}/${appointmentData.maxMembers} thành viên.`,
    data: {
      appointmentTitle: appointmentData.title,
      game: appointmentData.game,
      currentMembers: appointmentData.currentMembers,
      maxMembers: appointmentData.maxMembers,
      leftMemberId: userId
    }
  };

  await sendNotificationToAppointmentMembers(appointmentId, memberNotification);
}

/**
 * Handle tier change notification
 */
export async function notifyTierChanged(
  appointmentId: string,
  tierChange: TierChangeNotification
): Promise<void> {
  const appointment = await db.gameAppointment.findUnique({
    where: { id: appointmentId },
    include: {
      members: {
        where: { status: 'JOINED' }
      }
    }
  });

  if (!appointment) {
    console.error('Appointment not found for tier change notification:', appointmentId);
    return;
  }

  let title: string;
  let message: string;

  if (tierChange.newTier && tierChange.promotion) {
    // Tier upgraded or changed
    title = 'Tier hẹn chơi đã thay đổi!';
    message = `Tier của hẹn chơi "${appointment.title}" đã thay đổi từ ${tierChange.oldTier || 'Chưa kích hoạt'} sang ${tierChange.newTier}. Bạn được hưởng promotion: ${tierChange.promotion.promotion}`;
  } else if (!tierChange.newTier) {
    // Tier downgraded to none
    title = 'Tier hẹn chơi đã bị hủy!';
    message = `Tier của hẹn chơi "${appointment.title}" đã bị hủy do không đủ điều kiện. Cần admin kích hoạt thủ công.`;
  } else {
    // Tier downgraded
    title = 'Tier hẹn chơi đã giảm!';
    message = `Tier của hẹn chơi "${appointment.title}" đã giảm từ ${tierChange.oldTier} xuống ${tierChange.newTier}.`;
  }

  const notification: NotificationData = {
    type: 'TIER_CHANGED',
    appointmentId,
    title,
    message,
    data: {
      appointmentTitle: appointment.title,
      oldTier: tierChange.oldTier,
      newTier: tierChange.newTier,
      promotion: tierChange.promotion,
      memberCount: tierChange.memberCount,
      reason: tierChange.reason
    }
  };

  await sendNotificationToAppointmentMembers(appointmentId, notification);
}

/**
 * Handle appointment completed notification
 */
export async function notifyAppointmentCompleted(
  appointmentId: string,
  appointmentData: {
    title: string;
    game: string;
    tier?: string;
    promotion?: any;
    totalLockedAmount: number;
  }
): Promise<void> {
  const notification: NotificationData = {
    type: 'APPOINTMENT_COMPLETED',
    appointmentId,
    title: 'Hẹn chơi đã hoàn thành!',
    message: `Hẹn chơi "${appointmentData.title}" cho game ${appointmentData.game} đã hoàn thành thành công. Số tiền lock đã được hoàn trả.`,
    data: {
      appointmentTitle: appointmentData.title,
      game: appointmentData.game,
      tier: appointmentData.tier,
      promotion: appointmentData.promotion,
      totalLockedAmount: appointmentData.totalLockedAmount
    }
  };

  await sendNotificationToAppointmentMembers(appointmentId, notification);
}

/**
 * Handle appointment cancelled notification
 */
export async function notifyAppointmentCancelled(
  appointmentId: string,
  appointmentData: {
    title: string;
    game: string;
    reason?: string;
  }
): Promise<void> {
  const notification: NotificationData = {
    type: 'APPOINTMENT_CANCELLED',
    appointmentId,
    title: 'Hẹn chơi đã bị hủy!',
    message: `Hẹn chơi "${appointmentData.title}" cho game ${appointmentData.game} đã bị hủy. ${appointmentData.reason ? `Lý do: ${appointmentData.reason}` : ''}`,
    data: {
      appointmentTitle: appointmentData.title,
      game: appointmentData.game,
      reason: appointmentData.reason
    }
  };

  await sendNotificationToAppointmentMembers(appointmentId, notification);
}

/**
 * Send reminder notifications before appointment starts
 */
export async function sendAppointmentReminders(): Promise<void> {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Find appointments starting in 1 hour
    const appointmentsStartingSoon = await db.gameAppointment.findMany({
      where: {
        status: 'ACTIVE',
        startTime: {
          gte: now,
          lte: oneHourFromNow
        }
      },
      include: {
        members: {
          where: { status: 'JOINED' }
        }
      }
    });

    // Find appointments starting in 2 hours
    const appointmentsStartingLater = await db.gameAppointment.findMany({
      where: {
        status: 'ACTIVE',
        startTime: {
          gte: oneHourFromNow,
          lte: twoHoursFromNow
        }
      },
      include: {
        members: {
          where: { status: 'JOINED' }
        }
      }
    });

    // Send 1-hour reminders
    for (const appointment of appointmentsStartingSoon) {
      const notification: NotificationData = {
        type: 'APPOINTMENT_CREATED', // Reuse type for reminder
        appointmentId: appointment.id,
        title: 'Nhắc nhở: Hẹn chơi sắp bắt đầu!',
        message: `Hẹn chơi "${appointment.title}" sẽ bắt đầu trong 1 giờ nữa. Hãy chuẩn bị sẵn sàng!`,
        data: {
          appointmentTitle: appointment.title,
          game: appointment.game,
          startTime: appointment.startTime,
          reminderType: '1_HOUR'
        }
      };

      await sendNotificationToAppointmentMembers(appointment.id, notification);
    }

    // Send 2-hour reminders
    for (const appointment of appointmentsStartingLater) {
      const notification: NotificationData = {
        type: 'APPOINTMENT_CREATED', // Reuse type for reminder
        appointmentId: appointment.id,
        title: 'Nhắc nhở: Hẹn chơi sắp bắt đầu!',
        message: `Hẹn chơi "${appointment.title}" sẽ bắt đầu trong 2 giờ nữa.`,
        data: {
          appointmentTitle: appointment.title,
          game: appointment.game,
          startTime: appointment.startTime,
          reminderType: '2_HOURS'
        }
      };

      await sendNotificationToAppointmentMembers(appointment.id, notification);
    }

    console.log(`📅 Sent reminders for ${appointmentsStartingSoon.length} appointments starting in 1 hour and ${appointmentsStartingLater.length} appointments starting in 2 hours`);

  } catch (error) {
    console.error('Error sending appointment reminders:', error);
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<NotificationData[]> {
  try {
    // This would query your notifications table
    // For now, return empty array
    return [];

    // Example implementation:
    // const notifications = await prisma.notification.findMany({
    //   where: { userId },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    //   skip: offset
    // });
    // 
    // return notifications.map(notification => ({
    //   type: notification.type as any,
    //   appointmentId: notification.appointmentId,
    //   userId: notification.userId,
    //   title: notification.title,
    //   message: notification.message,
    //   data: notification.data
    // }));

  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
}
