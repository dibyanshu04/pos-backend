import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class RecipeComponentDto {
  @IsString()
  @IsNotEmpty()
  rawMaterialId: string;

  @IsString()
  @IsNotEmpty()
  rawMaterialName: string;

  @IsNumber()
  @Min(0.000001)
  quantityPerUnit: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}

class OrderItemDto {
  @IsString()
  menuItemId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  gstRate: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeComponentDto)
  @ArrayMinSize(1)
  recipeSnapshot: RecipeComponentDto[];
}

class CustomerDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  gstin?: string;
}

export class CreateOrderDto {
  @IsString()
  orderId: string;

  @IsString()
  @IsOptional()
  restaurantId?: string;

  @IsString()
  @IsOptional()
  tableId?: string; // Reference to restaurant-service table module (ObjectId as string)

  @IsString()
  @IsOptional()
  waiterId?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  gstAmount: number;

  @IsEnum(['dine-in', 'takeaway', 'delivery'])
  orderType: string;
}
