import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantPrismaService, MasterPrismaService, FnetPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';

@Injectable()
export class UserService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly fnetPrisma: FnetPrismaService,
  ) {}

  private async getTenant(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');
    return tenant;
  }

  private async getGatewayClient(tenantId: string) {
    const tenant = await this.getTenant(tenantId);
    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');
    return await this.tenantPrisma.getClient(dbUrl);
  }

  async syncFnetUsers(tenantId: string) {
    const tenant = await this.getTenant(tenantId);

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');

    const fnetUrl = (tenant as any).fnetUrl?.trim();
    if (!fnetUrl) throw new BadRequestException('Tenant chưa cấu hình fnetUrl');

    const gateway = await this.tenantPrisma.getClient(dbUrl);
    const fnet = await this.fnetPrisma.getClient(fnetUrl);

    // 1. Lấy danh sách user hội viên (UserType 2,6,7,8,9) + totalPayment từ FNET
    const fnetUsers: any[] = await fnet.$queryRawUnsafe(
      `SELECT u.UserId,
              CASE WHEN u.LastLoginDate = '0000-00-00' OR u.LastLoginDate IS NULL THEN NULL ELSE u.LastLoginDate END AS LastLoginDate,
              COALESCE(SUM(p.Amount), 0) AS totalPayment
       FROM usertb u
       LEFT JOIN paymenttb p ON u.UserId = p.UserId AND p.PaymentType = 4
       WHERE u.UserType IN (2, 6, 7, 8, 9)
       GROUP BY u.UserId, u.LastLoginDate`,
    );

    if (fnetUsers.length === 0) {
      return { success: true, syncedCount: 0, message: 'Không có user nào để đồng bộ' };
    }

    // 2. Upsert: insert mới hoặc update totalPayment + lastLogin nếu đã tồn tại
    const values = fnetUsers.map((u: any) => {
      const userId = Number(u.UserId);
      const totalPayment = Number(u.totalPayment) || 0;
      const lastLogin = u.LastLoginDate
        ? `'${new Date(u.LastLoginDate).toISOString().slice(0, 19).replace('T', ' ')}'`
        : 'NULL';
      return `(${userId}, 'HF-${userId}', 1, 0, 0, 1, '', ${lastLogin}, ${totalPayment}, NOW(), NOW())`;
    }).join(',\n');

    const affectedRows = await (gateway as any).$executeRawUnsafe(`
      INSERT INTO User (userId, userName, rankId, stars, magicStone, isUseApp, note, lastLogin, totalPayment, createdAt, updatedAt)
      VALUES ${values}
      ON DUPLICATE KEY UPDATE
        totalPayment = VALUES(totalPayment),
        lastLogin = VALUES(lastLogin),
        userName = IF(userName IS NULL OR userName = '', VALUES(userName), userName),
        updatedAt = NOW()
    `);

    return {
      success: true,
      totalFnetUsers: fnetUsers.length,
      affectedRows,
      message: `Đồng bộ thành công ${fnetUsers.length} tài khoản từ Fnet`,
    };
  }

  async updateNote(tenantId: string, userId: number, note: string) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      const user = await gatewayClient.user.findFirst({
        where: { userId },
      });

      if (!user) {
        // Find existing to make sure the user really doesn't exist
        // Note: Similar to monolith we create the User record if it doesn't exist in Gateway
        // However, in nestJS admin we might want to just create it directly
        const newUser = await gatewayClient.user.create({
          data: {
            userId,
            userName: `Không sử dụng - ${userId}`,
            rankId: 1,
            stars: 0,
            magicStone: 0,
            isUseApp: true,
            note,
          },
        });
        return { success: true, data: newUser };
      }

      const updatedUser = await gatewayClient.user.update({
        where: { userId: user.userId },
        data: { note },
      });

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Error updating user note:', error);
      throw new InternalServerErrorException(error.message || 'Error updating user note');
    }
  }

  async updateIsUseApp(tenantId: string, userId: number, isUseApp: boolean) {
    try {
      const gatewayClient = await this.getGatewayClient(tenantId);
      const user = await gatewayClient.user.findFirst({
        where: { userId },
      });

      if (!user) {
        const newUser = await gatewayClient.user.create({
          data: {
            userId,
            userName: `Không sử dụng - ${userId}`,
            rankId: 1,
            stars: 0,
            magicStone: 0,
            isUseApp,
            note: '',
          },
        });
        return { success: true, data: newUser };
      }

      const updatedUser = await gatewayClient.user.update({
        where: { userId: user.userId },
        data: { isUseApp },
      });

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Error updating user isUseApp:', error);
      throw new InternalServerErrorException(error.message || 'Error updating user isUseApp');
    }
  }
}
