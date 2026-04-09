import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantGatewayService } from '../../database/tenant-gateway.service';

@Injectable()
export class TodoTaskService {
  constructor(private readonly tenantGateway: TenantGatewayService) {}

  async findAll(tenantId: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.scheduleTask.findMany({
      where: { isActive: true },
      include: {
        createdBy: { select: { id: true, fullName: true, userName: true } },
        assignee: { select: { id: true, fullName: true, userName: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async create(tenantId: string, data: {
    title: string;
    description?: string;
    startTime: string;
    daysOfWeek: number[];
    assigneeId: number;
    createdById: number;
    color?: string;
    repeatInterval?: number;
    repeatMaxTimes?: number;
  }) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.scheduleTask.create({
      data: {
        title: data.title,
        description: data.description || null,
        startTime: data.startTime,
        daysOfWeek: data.daysOfWeek,
        assigneeId: data.assigneeId,
        createdById: data.createdById,
        color: data.color || null,
        repeatInterval: data.repeatInterval || 0,
        repeatMaxTimes: data.repeatMaxTimes || 0,
      },
      include: {
        createdBy: { select: { id: true, fullName: true, userName: true } },
        assignee: { select: { id: true, fullName: true, userName: true } },
      },
    });
  }

  async update(tenantId: string, id: number, data: {
    title?: string;
    description?: string;
    startTime?: string;
    daysOfWeek?: number[];
    assigneeId?: number;
    color?: string;
    repeatInterval?: number;
    repeatMaxTimes?: number;
  }) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const existing = await gateway.scheduleTask.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy công việc');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.daysOfWeek !== undefined) updateData.daysOfWeek = data.daysOfWeek;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.repeatInterval !== undefined) updateData.repeatInterval = data.repeatInterval;
    if (data.repeatMaxTimes !== undefined) updateData.repeatMaxTimes = data.repeatMaxTimes;

    return gateway.scheduleTask.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, fullName: true, userName: true } },
        assignee: { select: { id: true, fullName: true, userName: true } },
      },
    });
  }

  async remove(tenantId: string, id: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.scheduleTask.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDailyReport(tenantId: string, date?: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    const dayStart = date ? new Date(date) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const logs = await gateway.scheduleTaskLog.findMany({
      where: {
        notifiedAt: { gte: dayStart, lte: dayEnd },
      },
      include: {
        task: {
          include: {
            assignee: { select: { id: true, fullName: true, userName: true } },
          },
        },
      },
      orderBy: { notifiedAt: 'asc' },
    });

    return logs.map(log => ({
      logId: log.id,
      taskId: log.taskId,
      taskTitle: log.task.title,
      taskDescription: log.task.description,
      startTime: log.task.startTime,
      assigneeId: log.task.assignee.id,
      assigneeName: log.task.assignee.fullName,
      assigneeUserName: log.task.assignee.userName,
      notifiedAt: log.notifiedAt,
      acknowledgedAt: log.acknowledgedAt,
      repeatCount: log.repeatCount,
      responseTimeSeconds: log.acknowledgedAt
        ? Math.round((new Date(log.acknowledgedAt).getTime() - new Date(log.notifiedAt).getTime()) / 1000)
        : null,
    }));
  }

  async acknowledgeLog(tenantId: string, logId: number) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.scheduleTaskLog.update({
      where: { id: logId },
      data: { acknowledgedAt: new Date() },
    });
  }

  async getStaffList(tenantId: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.staff.findMany({
      where: { isDeleted: false },
      select: { id: true, fullName: true, userName: true, workShiftId: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async getShiftList(tenantId: string) {
    const gateway = await this.tenantGateway.getGatewayClient(tenantId);
    return gateway.workShift.findMany({
      select: { id: true, name: true, staffId: true },
      orderBy: { name: 'asc' },
    });
  }
}
