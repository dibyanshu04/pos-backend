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
}

export class CreateOrderWithKotDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

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
