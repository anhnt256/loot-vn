import { Injectable, BadRequestException } from '@nestjs/common';
import { MasterPrismaService, TenantPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { encrypt } from '../../lib/crypto';
import * as crypto from 'crypto';

@Injectable()
export class ConfigService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService
  ) {}

  private async getGatewayDb(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    const gateway = await this.tenantPrisma.getClient(dbUrl);

    // Auto-create table if not exists using Raw SQL to prevent Prisma client sync issues
    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS SystemConfig (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(100) UNIQUE,
        \`value\` TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    return gateway as any;
  }

  async getConfigs(tenantId: string) {
    const gateway = await this.getGatewayDb(tenantId);
    const configs: any[] = await gateway.$queryRawUnsafe(`SELECT \`key\`, \`value\` FROM SystemConfig`);

    // Convert to dictionary
    const results: Record<string, string> = {};
    for (const c of configs) {
      results[c.key] = c.value;
    }
    return results;
  }

  async updateConfigs(tenantId: string, updates: Record<string, string | number>) {
    const gateway = await this.getGatewayDb(tenantId);

    for (const [key, value] of Object.entries(updates)) {
      const valStr = String(value);
      await gateway.$executeRawUnsafe(`
        INSERT INTO SystemConfig (\`key\`, \`value\`, \`createdAt\`, \`updatedAt\`)
        VALUES (?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE \`value\` = ?, \`updatedAt\` = NOW()
      `, key, valStr, valStr);
    }

    return { success: true };
  }

  async getMomoCredential(tenantId: string) {
    const gateway = await this.getGatewayDb(tenantId);
    const cred = await gateway.momoCredential.findFirst();
    if (!cred) return null;
    return {
      id: Number(cred.id),
      storeId: cred.storeId,
      momoUrl: cred.momoUrl,
      merchantId: cred.merchantId,
      username: cred.username,
    };
  }

  async upsertMomoCredential(
    tenantId: string,
    data: { storeId?: string; momoUrl: string; merchantId?: string; username: string; password?: string }
  ) {
    const gateway = await this.getGatewayDb(tenantId);
    const existing = await gateway.momoCredential.findFirst();

    const payload: any = {
      storeId: data.storeId || null,
      momoUrl: data.momoUrl,
      merchantId: data.merchantId || null,
      username: data.username,
    };
    if (data.password) {
      payload.password = encrypt(data.password);
    }

    if (existing) {
      await gateway.momoCredential.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      if (!data.password) throw new BadRequestException('Password là bắt buộc khi tạo mới');
      payload.password = encrypt(data.password);
      await gateway.momoCredential.create({
        data: payload,
      });
    }

    return { success: true };
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async changePassword(
    userName: string,
    tenantId: string,
    body: { currentPassword: string; newPassword: string }
  ) {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Mật khẩu hiện tại và mật khẩu mới là bắt buộc');
    }

    const gateway = await this.getGatewayDb(tenantId);
    const staff = await gateway.staff.findFirst({
      where: { userName, isDeleted: false },
    });
    if (!staff) throw new BadRequestException('Không tìm thấy tài khoản');

    if (staff.password !== this.hashPassword(currentPassword)) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    await gateway.staff.update({
      where: { id: staff.id },
      data: { password: this.hashPassword(newPassword) },
    });

    return { success: true };
  }
}
