import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VariantValueDto {
  @ApiProperty({ example: 'Small' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Small Size' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ default: 0, example: 0, description: 'Price difference for this variant' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false, description: 'Base price if this is default variant' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

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
}

export class CreateVariantDto {
  @ApiProperty({ example: 'Size' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Item Size' })
  @IsOptional()
  @IsString()
  onlineDisplayName?: string;

  @ApiProperty({ example: 'Size Variants' })
  @IsString()
  department: string;

  @ApiProperty({
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: string;

  @ApiProperty()
  @IsString()
  restaurantId: string;

  @ApiProperty({ type: [VariantValueDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantValueDto)
  values?: VariantValueDto[];

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minSelection?: number;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelection?: number;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rank?: number;
}
