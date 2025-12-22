import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Variant, VariantSchema } from './schema/variant.schema';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Variant.name, schema: VariantSchema },
    ]),
  ],
  controllers: [VariantsController],
  providers: [VariantsService],
  exports: [VariantsService],
})
export class VariantsModule {}

