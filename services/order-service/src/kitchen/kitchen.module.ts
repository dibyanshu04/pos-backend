import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { Kitchen, KitchenSchema } from './schemas/kitchen.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Kitchen.name, schema: KitchenSchema }]),
  ],
  controllers: [KitchenController],
  providers: [KitchenService],
  exports: [KitchenService], // Export for use in orders module
})
export class KitchenModule {}

