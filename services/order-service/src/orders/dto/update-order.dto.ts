// src/orders/dto/update-order.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'completed',
    'cancelled',
  ])
  status?: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'refunded'])
  paymentStatus?: string;
}
