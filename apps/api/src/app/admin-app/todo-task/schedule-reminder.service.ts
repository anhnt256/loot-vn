import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TenantGatewayService } from '../../database/tenant-gateway.service';
import { OrderGateway } from '../order/order.gateway';

@Injectable()
export class ScheduleReminderService {
  private readonly logger = new Logger(ScheduleReminderService.name);

  constructor(
    private readonly tenantGateway: TenantGatewayService,
    private readonly orderGateway: OrderGateway,
  ) {}

  @Cron('5 * * * * *') // Mỗi phút, tại giây 5
  async checkScheduleTasks() {
    const server = this.orderGateway.server;
    if (!server) return;

    let activeTenantIds: string[];
    try {
      const sockets = await server.fetchSockets();
      const tenantSet = new Set<string>();
      sockets.forEach(s => {
        if (s.data?.tenantId) tenantSet.add(s.data.tenantId);
      });
      activeTenantIds = [...tenantSet];
    } catch {
      return;
    }

    if (activeTenantIds.length === 0) return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const tenantId of activeTenantIds) {
      try {
        const gateway = await this.tenantGateway.getGatewayClient(tenantId);

        // 1. Check task đúng giờ startTime
        const tasks = await gateway.scheduleTask.findMany({
          where: { isActive: true, startTime: currentTime },
          include: { assignee: { select: { id: true, fullName: true } } },
        });
        const matched = tasks.filter(t => (t.daysOfWeek as number[]).includes(currentDay));

        for (const task of matched) {
          const log = await gateway.scheduleTaskLog.create({
            data: { taskId: task.id, notifiedAt: now, repeatCount: 0 },
          });
          server.to(`admin:${tenantId}`).emit('schedule:reminder', [{
            id: task.id,
            logId: log.id,
            title: task.title,
            description: task.description,
            startTime: task.startTime,
            assignee: task.assignee.fullName,
            repeatCount: 0,
            repeatInterval: task.repeatInterval,
            repeatMaxTimes: task.repeatMaxTimes,
          }]);
        }

        if (matched.length > 0) {
          this.logger.log(`[${tenantId}] ${currentTime} — ${matched.length} task(s)`);
        }

        // 2. Check nhắc lại: log chưa acknowledged + task có repeatInterval > 0
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pendingLogs = await gateway.scheduleTaskLog.findMany({
          where: {
            acknowledgedAt: null,
            notifiedAt: { gte: today },
            task: { isActive: true, repeatInterval: { gt: 0 } },
          },
          include: {
            task: {
              include: { assignee: { select: { id: true, fullName: true } } },
            },
          },
        });

        for (const log of pendingLogs) {
          const task = log.task;
          if (log.repeatCount >= task.repeatMaxTimes) continue;

          // Check nếu đã đủ thời gian repeatInterval kể từ lần notify cuối
          const minutesSinceNotify = (now.getTime() - log.notifiedAt.getTime()) / 60000;
          const expectedRepeatAt = task.repeatInterval * (log.repeatCount + 1);
          if (minutesSinceNotify < expectedRepeatAt) continue;

          // Tăng repeatCount và gửi lại
          await gateway.scheduleTaskLog.update({
            where: { id: log.id },
            data: { repeatCount: log.repeatCount + 1 },
          });

          this.logger.log(`[${tenantId}] Repeat #${log.repeatCount + 1} — ${task.title}`);
          server.to(`admin:${tenantId}`).emit('schedule:reminder', [{
            id: task.id,
            logId: log.id,
            title: task.title,
            description: task.description,
            startTime: task.startTime,
            assignee: task.assignee.fullName,
            repeatCount: log.repeatCount + 1,
            repeatInterval: task.repeatInterval,
            repeatMaxTimes: task.repeatMaxTimes,
          }]);
        }
      } catch (err) {
        this.logger.warn(`[${tenantId}] Schedule check failed: ${err.message}`);
      }
    }
  }
}
