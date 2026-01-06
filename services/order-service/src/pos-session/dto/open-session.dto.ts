import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CashDrawerDto, DenominationDto } from './denomination.dto';

export class OpeningCashDrawerDto {
  @ApiProperty({
    description: 'Array of denominations with counts for opening cash drawer',
    type: [DenominationDto],
    example: [
      { value: 500, count: 10 },
      { value: 100, count: 5 },
      { value: 50, count: 20 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one denomination is required' })
  @ValidateNested({ each: true })
  @Type(() => DenominationDto)
  denominations: DenominationDto[];
}

export class OpenSessionDto {
  @ApiProperty({
    description: 'Restaurant ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Outlet ID where the session is being opened',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({
    description: 'Opening cash amount in the counter (calculated from denominations if provided)',
    example: 5000.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  openingCash: number;

  @ApiPropertyOptional({
    description: 'Denomination-wise opening cash drawer entry',
    type: OpeningCashDrawerDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OpeningCashDrawerDto)
  openingCashDrawer?: OpeningCashDrawerDto;

  @ApiPropertyOptional({
    description: 'Optional notes for opening the session',
    example: 'Starting morning shift',
  })
  @IsString()
  @IsOptional()
  openingNotes?: string;
}

