import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddonItemDto } from './addon-item.dto';

export class CreateAddonDto {
  @ApiProperty()
  @IsString()
  departmentName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  onlineDisplayName?: string;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  addonMin?: number;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  addonMax?: number;

  @ApiProperty({
    enum: ['Allow Multiple Selection', 'Allow Single Selection'],
    default: 'Allow Multiple Selection',
  })
  @IsOptional()
  @IsEnum(['Allow Multiple Selection', 'Allow Single Selection'])
  addonItemSelection?: string;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelectionPerAddonAllowed?: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  showInOnline?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  allowOpenQuantity?: boolean;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  rank?: number;

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

  @ApiProperty({ type: [AddonItemDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddonItemDto)
  items?: AddonItemDto[];
}

