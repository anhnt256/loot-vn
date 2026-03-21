import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantPrismaService, GatewayPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';

@Injectable()
export class ConfigService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService
  ) {}

  private async getGatewayDb(tenantId: string) {
    let tenant = await this.tenantPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.tenantPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    const gateway = await this.gatewayPrisma.getClient(dbUrl);
    
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
        INSERT INTO SystemConfig (\`key\`, \`value\`) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE \`value\` = ?
      `, key, valStr, valStr);
    }

    return { success: true };
  }
}
