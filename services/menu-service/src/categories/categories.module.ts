import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schema/category.schema';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { KitchenServiceClient } from '../common/clients/kitchen-service.client';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, KitchenServiceClient],
  exports: [CategoriesService],
})
export class CategoriesModule {}
