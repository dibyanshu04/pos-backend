// src/areas/dto/create-area.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAreaDto {
  @ApiProperty({ example: 'Patio', description: 'Name of the area' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], default: 'active' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string; // ✅ Fixed: simple string type

  @ApiProperty({ example: '693d2784b9756dd8c5320af8' })
  @IsMongoId()
  @IsNotEmpty()
  outletId: Types.ObjectId;
}
