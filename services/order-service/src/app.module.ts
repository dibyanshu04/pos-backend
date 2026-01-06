import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { PosSessionModule } from './pos-session/pos-session.module';
import { StaffShiftModule } from './staff-shift/staff-shift.module';
import { DayEndReportModule } from './day-end-report/day-end-report.module';
import { KitchenModule } from './kitchen/kitchen.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/order-service',
    ),
    OrdersModule,
    PosSessionModule,
    StaffShiftModule,
    DayEndReportModule,
    KitchenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
