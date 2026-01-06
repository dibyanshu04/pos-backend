import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RecipeComponentDto {
  @ApiProperty({
    description: 'Raw material ID (must be active and outlet-scoped)',
    example: '64f0c9a2b7d3c2f1a1234567',
  })
  @IsMongoId()
  @IsNotEmpty()
  rawMaterialId: string;

  @ApiProperty({
    description: 'Quantity consumed per 1 unit of menu item (BASE UNIT ONLY). Must be > 0.',
    example: 120,
    minimum: 0.0001,
  })
  @IsNumber()
  @Min(0.0001)
  quantityPerUnit: number;
}

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Restaurant ID (tenant scope)',
    example: 'restaurant-123',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Outlet ID (recipe is outlet-scoped)',
    example: 'outlet-789',
  })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({
    description: 'Menu item ID from menu-service',
    example: 'menu-item-456',
  })
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @ApiPropertyOptional({
    description: 'Audit user creating the recipe',
    example: 'user-1',
  })
  @IsOptional()
  @IsString()
  createdByUserId?: string;

  @ApiProperty({
    type: [RecipeComponentDto],
    description:
      'List of raw materials consumed per 1 unit of menu item. All quantities are in BASE UNIT (GM/ML/PCS).',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeComponentDto)
  components: RecipeComponentDto[];
}

