// src/orders/dto/order-response.dto.ts
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class OrderResponseDto {
  @Expose()
  orderId: string;

  @Expose()
  tableNumber?: number;

  @Expose()
  customer: {
    name: string;
    phone: string;
    gstin?: string;
  };

  @Expose()
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
    gstRate: number;
  }>;

  @Expose()
  totalAmount: number;

  @Expose()
  gstAmount: number;

  @Expose()
  orderType: string;

  @Expose()
  status: string;

  @Expose()
  paymentStatus: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;
}
