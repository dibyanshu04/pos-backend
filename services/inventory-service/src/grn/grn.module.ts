import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryLedger, InventoryLedgerSchema } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterial, RawMaterialSchema } from 'src/raw-material/raw-material.schema';
import { Vendor, VendorSchema } from 'src/vendor/vendor.schema';
import { LowStockAlertModule } from 'src/low-stock-alert/low-stock-alert.module';
import { GrnController } from './grn.controller';
import { GrnService } from './grn.service';
import { Grn, GrnSchema } from './grn.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Grn.name, schema: GrnSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: RawMaterial.name, schema: RawMaterialSchema },
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
    ]),
    LowStockAlertModule,
  ],
  controllers: [GrnController],
  providers: [GrnService],
})
export class GrnModule {}

