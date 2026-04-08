import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { redisService } from '../lib/redis-service';
import { verifyJWT } from '../lib/jwt';

/**
 * Paths bỏ qua maintenance check (luôn cho phép truy cập)
 */
const BYPASS_PREFIXES = [
  '/auth/',
  '/auth',
  '/maintenance/',
  '/maintenance',
];

/**
 * Middleware chặn tất cả request khi hệ thống đang bảo trì.
 * - Admin/SUPER_ADMIN: bypass
 * - Client: trả 503
 */
@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MaintenanceMiddleware.name);

  async use(req: Request, res: Response, next: NextFunction) {
    // Dùng cả originalUrl, baseUrl, path để đảm bảo match
    const url = req.originalUrl || req.url || '';
    const path = req.path || '';

    if (BYPASS_PREFIXES.some((prefix) => url.startsWith(prefix) || path.startsWith(prefix))) {
      return next();
    }

    const tenantId =
      (req.headers['x-tenant-id'] as string)?.trim() || null;
    if (!tenantId) {
      return next();
    }

    // Check Redis
    const raw = await redisService.get(`${tenantId}:maintenance`);
    if (!raw) {
      return next();
    }

    let status: { enabled: boolean; note?: string; scheduledEnd?: string };
    try {
      status = JSON.parse(raw);
    } catch {
      return next();
    }

    if (!status.enabled) {
      return next();
    }

    // Cho phép admin/SUPER_ADMIN bypass
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      try {
        const payload = await verifyJWT(token);
        if (payload && (payload.staffType === 'SUPER_ADMIN' || payload.isAdmin)) {
          return next();
        }
      } catch {
        // Token không hợp lệ → vẫn chặn
      }
    }

    // Chặn request
    return res.status(503).json({
      statusCode: 503,
      message: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
      note: status.note || '',
      scheduledEnd: status.scheduledEnd || null,
    });
  }
}
