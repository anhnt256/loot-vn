import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { FnetPrismaService } from '../../database/prisma.service';

@Module({
  controllers: [MenuController],
  providers: [MenuService, FnetPrismaService],
  exports: [MenuService],
})
export class MenuModule {}
