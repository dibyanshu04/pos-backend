import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeComponentDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeComponentDto)
  @ArrayMinSize(1)
  recipeSnapshot: RecipeComponentDto[];

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
