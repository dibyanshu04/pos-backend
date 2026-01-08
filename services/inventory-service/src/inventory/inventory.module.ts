import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import {
  InventoryLedger,
  InventoryLedgerSchema,
} from './schemas/inventory-ledger.schema';
import {
  RawMaterial,
  RawMaterialSchema,
} from './schemas/raw-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
      { name: RawMaterial.name, schema: RawMaterialSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}

