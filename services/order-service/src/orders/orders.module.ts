// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { KotController } from './kot.controller';
import { PaymentsController } from '../payments/payments.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderItem, OrderItemSchema } from './schemas/order-item.schema';
import { KOT, KotSchema } from './schemas/kot.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { TableServiceClient } from './services/table-service.client';
import { MenuServiceClient } from './services/menu-service.client';
import { TaxConfigService } from './services/tax-config.service';
import { InventoryServiceClient } from './services/inventory-service.client';
import { PosSessionModule } from '../pos-session/pos-session.module';
import { KitchenModule } from '../kitchen/kitchen.module';
import { CoursesModule } from '../courses/courses.module';
import { RestaurantServiceClient } from './services/restaurant-service.client';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: KOT.name, schema: KotSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    PosSessionModule,
    KitchenModule,
    CoursesModule,
  ],
  controllers: [OrdersController, KotController, PaymentsController],
  providers: [
    OrdersService,
    TableServiceClient,
    MenuServiceClient,
    TaxConfigService,
    InventoryServiceClient,
    RestaurantServiceClient,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
