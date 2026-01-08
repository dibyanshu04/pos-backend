import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
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
  @IsPositive()
  quantityPerUnit: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}

export class ConsumeItemDto {
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @IsString()
  @IsNotEmpty()
  menuItemName: string;

  @IsNumber()
  @IsPositive()
  quantityOrdered: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeComponentDto)
  @ArrayMinSize(1)
  recipeSnapshot: RecipeComponentDto[];
}

export class ConsumeInventoryDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  outletId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsumeItemDto)
  @ArrayMinSize(1)
  items: ConsumeItemDto[];
}

