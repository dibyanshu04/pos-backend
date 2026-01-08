import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';

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

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Category IDs linked to this menu',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Item IDs linked to this menu',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itemIds?: string[];
}
