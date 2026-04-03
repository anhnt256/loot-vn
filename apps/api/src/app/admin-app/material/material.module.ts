import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { InventoryEngineService } from './inventory-engine.service';

@Module({
  controllers: [MaterialController],
  providers: [MaterialService, InventoryEngineService],
  exports: [MaterialService, InventoryEngineService],
})
export class MaterialModule {}
