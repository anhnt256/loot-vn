import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { TenantPrismaService } from '../database/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: TenantPrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No API key provided');
    }

    const fullKey = authHeader.split(' ')[1];
    
    // Stripe-style format: gms_keyid.secret
    if (!fullKey.startsWith('gms_') || !fullKey.includes('.')) {
      throw new UnauthorizedException('Invalid API key format');
    }

    const [prefixAndId, secret] = fullKey.split('.');
    const keyId = prefixAndId.replace('gms_', '');

    // Extract tenant ID from header for verification
    const requestedTenantId = request.headers['x-tenant-id'];

    const apiKeyRecord = await this.prisma.apiKey.findUnique({
      where: { keyId, deletedAt: null },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Verify tenant match
    if (requestedTenantId && apiKeyRecord.tenantId !== requestedTenantId) {
      throw new UnauthorizedException('API key does not belong to this tenant');
    }

    // Verify expiration
    if (apiKeyRecord.expiresAt && new Date() > new Date(apiKeyRecord.expiresAt)) {
      throw new UnauthorizedException('Hệ thống đã hết hạn, vui lòng gia hạn để sử dụng');
    }

    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');
    if (secretHash !== apiKeyRecord.secretHash) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Attach tenant info to request
    request.tenantId = apiKeyRecord.tenantId;
    request.apiKeyName = apiKeyRecord.name;

    return true;
  }
}
