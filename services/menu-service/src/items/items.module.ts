import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item, ItemSchema } from './schema/item.schema';
import { Tax, TaxSchema } from '../taxes/schema/taxes.schema';
import { Menu, MenuSchema } from '../menus/schema/menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Tax.name, schema: TaxSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
