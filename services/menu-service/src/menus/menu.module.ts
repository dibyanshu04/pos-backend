import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from '../categories/categories.module';
import { ItemsModule } from '../items/items.module';
import { Menu, MenuSchema } from './schema/menu.schema';
import { MenusController } from './men.controller';
import { MenusService } from './menu.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
    CategoriesModule,
    ItemsModule,
  ],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
