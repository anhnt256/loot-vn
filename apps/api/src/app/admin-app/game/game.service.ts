import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TenantPrismaService, GatewayPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class GameService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService,
    private readonly configService: ConfigService,
  ) {}

  private async getGatewayClient(tenantId: string) {
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

    return await this.gatewayPrisma.getClient(dbUrl);
  }

  async getFund(tenantId: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      
      const lastJackPotDate = await gatewayClient.$queryRaw`
        SELECT createdAt FROM GameResult 
        WHERE itemId = 8
        ORDER BY createdAt DESC
        LIMIT 1
      ` as any[];

      let totalRound;
      if (lastJackPotDate.length > 0) {
        // Must convert date to string for raw query if needed, or pass it as parameter
        // Prisma raw handles parameters safely
        const totalRoundResult = await gatewayClient.$queryRaw`
          SELECT COUNT(*) as count FROM GameResult gr
          INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
          WHERE gr.createdAt > ${lastJackPotDate[0].createdAt}
        ` as any[];
        totalRound = Number(totalRoundResult[0].count);
      } else {
        const totalRoundResult = await gatewayClient.$queryRaw`
          SELECT COUNT(*) as count FROM GameResult gr
          INNER JOIN UserStarHistory ush ON gr.id = ush.targetId AND ush.type = 'GAME'
        ` as any[];
        totalRound = Number(totalRoundResult[0].count);
      }

      // Lấy ROUND_COST và GAME_FUND_RATE từ config DB
      const configs = await this.configService.getConfigs(tenantId);
      const ROUND_COST = Number(configs['SPEND_PER_ROUND']) || Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND || 30000); 
      const rateConfig = Number(configs['GAME_FUND_RATE']) || 1.5;
      const RATE = rateConfig / 100; // 1.5% -> 0.015
      
      const totalAmount = totalRound * ROUND_COST * RATE;
      
      return totalAmount;

    } catch (error) {
      console.error('Failed to fetch fund amount:', error);
      throw new InternalServerErrorException('Failed to fetch fund amount');
    }
  }
}
