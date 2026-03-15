import { Module, Global } from '@nestjs/common';
import {
  PrismaService,
  TenantPrismaService,
  FnetGVPrismaService,
  FnetTPPrismaService,
} from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, TenantPrismaService, FnetGVPrismaService, FnetTPPrismaService],
  exports: [PrismaService, TenantPrismaService, FnetGVPrismaService, FnetTPPrismaService],
})
export class DatabaseModule {}
