import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  days: string[];

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  onlineDisplayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  outletId: string;

  @ApiProperty({
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isParentCategory?: boolean;

  @ApiProperty({ required: false, default: null })
  @IsOptional()
  @IsString()
  parentCategoryId?: string | null;

  @ApiProperty({ required: false, type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  offlineOrdersImageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  swiggyImageUrl?: string;

  @ApiProperty({ required: false, type: [ScheduleDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules?: ScheduleDto[];

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  rank?: number;
}
