import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DayEndReportController } from './day-end-report.controller';
import { DayEndReportService } from './day-end-report.service';
import {
  DayEndReport,
  DayEndReportSchema,
} from './schemas/day-end-report.schema';
import {
  PosSession,
  PosSessionSchema,
} from '../pos-session/schemas/pos-session.schema';
import { StaffShift, StaffShiftSchema } from '../staff-shift/schemas/staff-shift.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Payment, PaymentSchema } from '../orders/schemas/payment.schema';
import { OrderItem, OrderItemSchema } from '../orders/schemas/order-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DayEndReport.name, schema: DayEndReportSchema },
      { name: PosSession.name, schema: PosSessionSchema },
      { name: StaffShift.name, schema: StaffShiftSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
  ],
  controllers: [DayEndReportController],
  providers: [DayEndReportService],
  exports: [DayEndReportService],
})
export class DayEndReportModule {}

