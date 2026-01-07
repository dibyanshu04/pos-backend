import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LowStockAlertModule } from 'src/low-stock-alert/low-stock-alert.module';
import { RawMaterialController } from './raw-material.controller';
import { RawMaterialService } from './raw-material.service';
import { RawMaterial, RawMaterialSchema } from './raw-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RawMaterial.name, schema: RawMaterialSchema },
    ]),
    LowStockAlertModule,
  ],
  controllers: [RawMaterialController],
  providers: [RawMaterialService],
  exports: [RawMaterialService],
})
export class RawMaterialModule {}

