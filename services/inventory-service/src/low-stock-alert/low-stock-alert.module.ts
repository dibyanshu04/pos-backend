import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryLedger, InventoryLedgerSchema } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterial, RawMaterialSchema } from 'src/raw-material/raw-material.schema';
import { LowStockAlertController } from './low-stock-alert.controller';
import { LowStockAlertService } from './low-stock-alert.service';
import { LowStockAlert, LowStockAlertSchema } from './low-stock-alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LowStockAlert.name, schema: LowStockAlertSchema },
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
      { name: RawMaterial.name, schema: RawMaterialSchema },
    ]),
  ],
  controllers: [LowStockAlertController],
  providers: [LowStockAlertService],
  exports: [LowStockAlertService],
})
export class LowStockAlertModule {}

