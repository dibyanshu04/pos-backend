import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsBoolean, IsString } from 'class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  version?: number;
}
