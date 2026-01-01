import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  IsIn,
  Min,
  Max,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateTaxDto {
  @ApiProperty({ example: 'GST 18%' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Goods and Services Tax' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'GST' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiProperty()
  @IsString()
  restaurantId: string;

  @ApiProperty({ required: false, type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outletIds?: string[];

  @ApiProperty({
    enum: ['PERCENTAGE', 'FIXED'],
    default: 'PERCENTAGE',
    example: 'PERCENTAGE',
  })
  @IsEnum(['PERCENTAGE', 'FIXED'])
  taxType: 'PERCENTAGE' | 'FIXED';

  @ApiProperty({ example: 18, description: 'Percentage (0-100) or fixed amount (>= 0)' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({
    enum: ['INCLUSIVE', 'EXCLUSIVE'],
    default: 'EXCLUSIVE',
    example: 'EXCLUSIVE',
  })
  @IsEnum(['INCLUSIVE', 'EXCLUSIVE'])
  inclusionType: 'INCLUSIVE' | 'EXCLUSIVE';

  @ApiProperty({
    enum: ['ITEM', 'CATEGORY', 'BILL'],
    default: 'ITEM',
    example: 'ITEM',
  })
  @IsEnum(['ITEM', 'CATEGORY', 'BILL'])
  scope: 'ITEM' | 'CATEGORY' | 'BILL';

  @ApiProperty({ required: false, type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itemIds?: string[];

  @ApiProperty({ required: false, type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({ required: false, type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedItemIds?: string[];

  @ApiProperty({ required: false, type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategoryIds?: string[];

  @ApiProperty({ default: 0, example: 1, description: 'Lower number = higher priority' })
  @IsNumber()
  @Min(0)
  priority: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isCompound?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isRoundOff?: boolean;

  @ApiProperty({
    required: false,
    enum: ['ROUND_UP', 'ROUND_DOWN', 'ROUND_NEAREST'],
    default: 'ROUND_NEAREST',
  })
  @IsOptional()
  @IsEnum(['ROUND_UP', 'ROUND_DOWN', 'ROUND_NEAREST'])
  roundOffMethod?: 'ROUND_UP' | 'ROUND_DOWN' | 'ROUND_NEAREST';

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  showOnBill?: boolean;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  showOnMenu?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: string;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rank?: number;

  // Petpooja-style fields
  @ApiProperty({
    required: false,
    enum: ['GST_SLAB', 'VAT', 'OTHER'],
    default: 'OTHER',
    description: 'Tax category: GST Slab (creates CGST/SGST), VAT, or Other',
  })
  @IsOptional()
  @IsEnum(['GST_SLAB', 'VAT', 'OTHER'])
  taxCategory?: 'GST_SLAB' | 'VAT' | 'OTHER';

  @ApiProperty({
    required: false,
    enum: ['FORWARD', 'BACKWARD'],
    default: 'FORWARD',
    description: 'Forward: Tax added to price, Backward: Tax included in price',
  })
  @IsOptional()
  @IsEnum(['FORWARD', 'BACKWARD'])
  calculationType?: 'FORWARD' | 'BACKWARD';

  @ApiProperty({
    required: false,
    type: [String],
    default: [],
    enum: ['Delivery', 'Pick Up', 'Dine In'],
    description: 'Order types where this tax applies',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableOrderTypes?: string[];

  @ApiProperty({
    required: false,
    default: false,
    description: 'Mandatory tax - cannot be removed even if user has rights',
  })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiProperty({ required: false, description: 'CGST SAP Code' })
  @IsOptional()
  @IsString()
  cgstSapCode?: string;

  @ApiProperty({ required: false, description: 'SGST SAP Code' })
  @IsOptional()
  @IsString()
  sgstSapCode?: string;

  @ApiProperty({
    required: false,
    description: 'Custom tax title for display on bills (e.g., "CGST", "SGST")',
  })
  @IsOptional()
  @IsString()
  taxTitle?: string;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Do not print e-Commerce operators',
  })
  @IsOptional()
  @IsBoolean()
  excludeFromEcommerce?: boolean;
}
