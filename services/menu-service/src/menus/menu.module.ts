import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from '../categories/categories.module';
import { ItemsModule } from '../items/items.module';
import { Menu, MenuSchema } from './schema/menu.schema';
import { Item, ItemSchema } from '../items/schema/item.schema';
import { Category, CategorySchema } from '../categories/schema/category.schema';
import { MenusController } from './men.controller';
import { MenusService } from './menu.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CategoriesModule,
    ItemsModule,
  ],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
