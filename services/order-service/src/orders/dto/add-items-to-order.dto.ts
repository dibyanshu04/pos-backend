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

export class AddOrderItemDto {
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

export class AddItemsToOrderDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddOrderItemDto)
  items: AddOrderItemDto[];
}
