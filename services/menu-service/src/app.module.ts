import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';
import { MenusModule } from './menus/menu.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/menu-service',
    ),
    MenusModule,
    CategoriesModule,
    ItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
