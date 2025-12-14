// src/tables/dto/create-table.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateTableDto {
  @ApiProperty({ example: 'Table 1', description: 'The name of the table' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // ✅ Renamed to match Schema exactly
  @ApiProperty({ example: 4, description: 'Seating capacity' })
  @IsInt()
  @IsNotEmpty()
  seatingCapacity: number;

  @ApiProperty({
    example: '693d2784b9756dd8c5320af8',
    description: 'Associated Outlet ID',
  })
  @IsMongoId() // Ensures it's a valid ID format
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({ example: '693e4fb07daf65808590f52f', description: 'Area ID' })
  @IsMongoId()
  @IsNotEmpty()
  areaId: string;
}
