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


  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;


  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rank?: number;
}
