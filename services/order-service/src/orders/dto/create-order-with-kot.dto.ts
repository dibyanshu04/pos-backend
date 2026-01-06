import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemInputDto {
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @IsOptional()
  isComplimentary?: boolean; // Mark item as complimentary (requires RBAC)

  @IsString()
  @IsOptional()
  complimentaryReason?: string; // Reason for complimentary (required if isComplimentary = true)
}

export class CreateOrderWithKotDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  outletId: string; // Outlet ID for POS session lookup

  @IsString()
  @IsNotEmpty()
  tableId: string; // Will be converted to ObjectId

  @IsString()
  @IsNotEmpty()
  waiterId: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
