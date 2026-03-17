import { Module, Global } from '@nestjs/common';
import {
  PrismaService,
  TenantPrismaService,
  FnetPrismaService,
  GatewayPrismaService,
} from './prisma.service';
import { TenantGatewayService } from './tenant-gateway.service';

@Global()
@Module({
  providers: [PrismaService, TenantPrismaService, FnetPrismaService, GatewayPrismaService, TenantGatewayService],
  exports: [PrismaService, TenantPrismaService, FnetPrismaService, GatewayPrismaService, TenantGatewayService],
})
export class DatabaseModule {}
