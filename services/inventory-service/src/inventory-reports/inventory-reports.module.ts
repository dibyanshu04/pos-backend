import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryLedger, InventoryLedgerSchema } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterial, RawMaterialSchema } from 'src/raw-material/raw-material.schema';
import { InventoryReportsController } from './inventory-reports.controller';
import { InventoryReportsService } from './inventory-reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
      { name: RawMaterial.name, schema: RawMaterialSchema },
    ]),
  ],
  controllers: [InventoryReportsController],
  providers: [InventoryReportsService],
})
export class InventoryReportsModule {}

