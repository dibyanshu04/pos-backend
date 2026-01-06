import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LowStockAlertModule } from 'src/low-stock-alert/low-stock-alert.module';
import { InventoryLedgerController } from './inventory-ledger.controller';
import { InventoryLedgerService } from './inventory-ledger.service';
import {
  InventoryLedger,
  InventoryLedgerSchema,
} from './inventory-ledger.schema';
import { RawMaterial, RawMaterialSchema } from 'src/raw-material/raw-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
      { name: RawMaterial.name, schema: RawMaterialSchema },
    ]),
    LowStockAlertModule,
  ],
  controllers: [InventoryLedgerController],
  providers: [InventoryLedgerService],
  exports: [InventoryLedgerService],
})
export class InventoryLedgerModule {}

