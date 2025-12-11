import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  displayOrder?: number;
}

export class CreateMenuDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['base', 'zomato', 'swiggy', 'custom'] })
  @IsEnum(['base', 'zomato', 'swiggy', 'custom'])
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  baseMenuId?: string;

  @ApiProperty()
  @IsString()
  outletId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [CategoryDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories?: CategoryDto[];
}
