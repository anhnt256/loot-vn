import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { GatewayPrismaService, TenantPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';

@Injectable()
export class UserService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly gatewayPrisma: GatewayPrismaService
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
        where: { id: user.id },
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
        where: { id: user.id },
        data: { isUseApp },
      });

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Error updating user isUseApp:', error);
      throw new InternalServerErrorException(error.message || 'Error updating user isUseApp');
    }
  }
}
