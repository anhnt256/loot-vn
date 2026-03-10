import { Module, Global } from '@nestjs/common';
import {
  PrismaService,
  FnetGVPrismaService,
  FnetTPPrismaService,
} from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, FnetGVPrismaService, FnetTPPrismaService],
  exports: [PrismaService, FnetGVPrismaService, FnetTPPrismaService],
})
export class DatabaseModule {}
