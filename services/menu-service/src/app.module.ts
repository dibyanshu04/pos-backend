import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';
import { MenusModule } from './menus/menu.module';
import { VariantsModule } from './variants/variants.module';
import { AddonsModule } from './addons/addons.module';
import { TaxesModule } from './taxes/taxes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/menu-service',
    ),
    MenusModule,
    TaxesModule,
    CategoriesModule,
    ItemsModule,
    VariantsModule,
    AddonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
