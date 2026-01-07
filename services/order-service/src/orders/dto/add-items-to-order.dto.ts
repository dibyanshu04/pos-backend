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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeComponentDto)
  @ArrayMinSize(1)
  recipeSnapshot: RecipeComponentDto[];
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
