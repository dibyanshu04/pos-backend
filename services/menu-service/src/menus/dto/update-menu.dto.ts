import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto, CategoryDto } from './create-menu.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({ type: [CategoryDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories?: CategoryDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  version?: number;
}
