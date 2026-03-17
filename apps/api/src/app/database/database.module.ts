import { Module, Global } from '@nestjs/common';
import {
  PrismaService,
  TenantPrismaService,
  FnetPrismaService,
} from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, TenantPrismaService, FnetPrismaService],
  exports: [PrismaService, TenantPrismaService, FnetPrismaService],
})
export class DatabaseModule {}
