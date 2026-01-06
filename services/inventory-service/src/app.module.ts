import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RawMaterialModule } from './raw-material/raw-material.module';
import { InventoryLedgerModule } from './inventory-ledger/inventory-ledger.module';
import { RecipeModule } from './recipe/recipe.module';
import { VendorModule } from './vendor/vendor.module';
import { GrnModule } from './grn/grn.module';
import { InventoryReportsModule } from './inventory-reports/inventory-reports.module';
import { LowStockAlertModule } from './low-stock-alert/low-stock-alert.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/inventory-service',
    ),
    RawMaterialModule,
    InventoryLedgerModule,
    RecipeModule,
    VendorModule,
    GrnModule,
    InventoryReportsModule,
    LowStockAlertModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

