import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class VariantPricingDto {
  @ApiProperty({ description: 'Variant ID', example: 'variantId1' })
  @IsString()
  variant: string;

  @ApiProperty({ description: 'Price for this variant', example: 100 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Menu ID to attach the item to' })
  @IsString()
  menuId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shortCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  onlineDisplayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ required: false, type: [String], default: [], description: 'Array of Tax IDs to apply to this item' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taxIds?: string[];

  @ApiProperty({ required: false, type: [String], default: [], description: 'Array of Variant IDs applicable to this item' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variantIds?: string[];

  @ApiProperty({ required: false, type: [String], default: [], description: 'Array of Addon IDs applicable to this item' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonIds?: string[];

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  baseItemId?: string;

  @ApiProperty()
  @IsString()
  outletId: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ required: false, enum: ['Veg', 'Non-Veg', 'Egg', 'Vegan', 'Jain', 'Gluten-Free'] })
  @IsOptional()
  @IsIn(['Veg', 'Non-Veg', 'Egg', 'Vegan', 'Jain', 'Gluten-Free'])
  dietaryType?: 'Veg' | 'Non-Veg' | 'Egg' | 'Vegan' | 'Jain' | 'Gluten-Free';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryTags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false, enum: ['Goods', 'Service'] })
  @IsOptional()
  @IsIn(['Goods', 'Service'])
  gstType?: 'Goods' | 'Service';

  @ApiProperty({ required: false, isArray: true, enum: ['Dine-In', 'Takeaway', 'Delivery', 'Expose-Online'] })
  @IsOptional()
  @IsArray()
  @IsIn(['Dine-In', 'Takeaway', 'Delivery', 'Expose-Online'], { each: true })
  orderType?: ('Dine-In' | 'Takeaway' | 'Delivery' | 'Expose-Online')[];


  @ApiProperty({
    required: false,
    type: [VariantPricingDto],
    description: 'Variant pricing array. Each entry contains a variant ID and its price for this item.',
    example: [{ variant: 'variantId1', price: 100 }, { variant: 'variantId2', price: 50 }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantPricingDto)
  variantPricing?: VariantPricingDto[];
}
