import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Taxes, TaxesSchema } from './schema/taxes.schema';
import { TaxesController } from './taxes.controller';
import { TaxesService } from './taxes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Taxes.name, schema: TaxesSchema }]),
  ],
  controllers: [TaxesController],
  providers: [TaxesService],
  exports: [TaxesService],
})
export class TaxesModule {}
