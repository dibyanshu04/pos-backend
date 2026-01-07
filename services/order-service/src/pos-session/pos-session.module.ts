import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PosSessionController } from './pos-session.controller';
import { PosSessionService } from './pos-session.service';
import { PosSession, PosSessionSchema } from './schemas/pos-session.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Payment, PaymentSchema } from '../orders/schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PosSession.name, schema: PosSessionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [PosSessionController],
  providers: [PosSessionService],
  exports: [PosSessionService],
})
export class PosSessionModule {}

