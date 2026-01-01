import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddonItemVariantDto {
  @ApiProperty({ description: 'Variant ID reference' })
  @IsString()
  variantId: string;

  @ApiProperty({ example: 'Large', description: 'Selected variant value name' })
  @IsString()
  variantValueName: string;

  @ApiProperty({
    required: false,
    default: 0,
    description: 'Price adjustment for this variant on addon item',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceModifier?: number;
}

export class AddonItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sapCode?: string;

  @ApiProperty({
    enum: ['Veg', 'Non-Veg', 'Egg'],
    default: 'Veg',
  })
  @IsOptional()
  @IsEnum(['Veg', 'Non-Veg', 'Egg'])
  attribute?: string;

  @ApiProperty({
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  available?: string;

  // Variant support for addon items
  @ApiProperty({
    required: false,
    type: [String],
    default: [],
    description: 'Variant IDs that can be applied to this addon item',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableVariantIds?: string[];

  @ApiProperty({
    required: false,
    type: [AddonItemVariantDto],
    default: [],
    description: 'Variant-specific pricing for this addon item',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddonItemVariantDto)
  variantPricing?: AddonItemVariantDto[];

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rank?: number;
}
