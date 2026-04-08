import { Injectable, Logger } from '@nestjs/common';
import { redisService } from '../../lib/redis-service';

export interface MaintenanceStatus {
  enabled: boolean;
  note: string;
  startedAt: string | null;
  scheduledEnd: string | null;
}

const maintenanceKey = (tenantId: string) => `${tenantId}:maintenance`;

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  async getStatus(tenantId: string): Promise<MaintenanceStatus> {
    const key = maintenanceKey(tenantId);
    const raw = await redisService.get(key);
    this.logger.log(`[getStatus] key=${key} raw=${raw}`);
    if (!raw) {
      return { enabled: false, note: '', startedAt: null, scheduledEnd: null };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { enabled: false, note: '', startedAt: null, scheduledEnd: null };
    }
  }

  async enable(
    tenantId: string,
    note: string,
    durationMinutes: number | null,
  ): Promise<MaintenanceStatus> {
    const now = new Date();
    const scheduledEnd = durationMinutes
      ? new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString()
      : null;

    const status: MaintenanceStatus = {
      enabled: true,
      note,
      startedAt: now.toISOString(),
      scheduledEnd,
    };

    const key = maintenanceKey(tenantId);
    const value = JSON.stringify(status);

    // Xoá key cũ trước khi set mới (tránh TTL cũ còn sót)
    await redisService.del(key);

    if (durationMinutes) {
      const ttl = durationMinutes * 60;
      await redisService.setex(key, ttl, value);
      this.logger.log(`[enable] key=${key} ttl=${ttl}s scheduledEnd=${scheduledEnd} value=${value}`);
    } else {
      await redisService.set(key, value);
      this.logger.log(`[enable] key=${key} no-ttl (unlimited) value=${value}`);
    }

    return status;
  }

  async disable(tenantId: string): Promise<MaintenanceStatus> {
    const key = maintenanceKey(tenantId);
    await redisService.del(key);
    this.logger.log(`[disable] key=${key} deleted`);
    return { enabled: false, note: '', startedAt: null, scheduledEnd: null };
  }
}
