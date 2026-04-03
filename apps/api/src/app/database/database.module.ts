import { Module, Global } from '@nestjs/common';
import {
  MasterPrismaService,
  TenantPrismaService,
  FnetPrismaService,
} from './prisma.service';
import { TenantGatewayService } from './tenant-gateway.service';

@Global()
@Module({
  providers: [MasterPrismaService, TenantPrismaService, FnetPrismaService, TenantGatewayService],
  exports: [MasterPrismaService, TenantPrismaService, FnetPrismaService, TenantGatewayService],
})
export class DatabaseModule {}
