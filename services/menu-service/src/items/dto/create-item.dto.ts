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

class VariationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateItemDto {
  @ApiProperty()
  @IsString()
  name: string;

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

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;

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

  @ApiProperty({ required: false, type: [VariationDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VariationDto)
  variations?: VariationDto[];
}
