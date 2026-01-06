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
import { DenominationDto } from './denomination.dto';

export class ClosingCashDrawerDto {
  @ApiProperty({
    description: 'Array of denominations with counts for closing cash drawer',
    type: [DenominationDto],
    example: [
      { value: 500, count: 8 },
      { value: 100, count: 4 },
      { value: 50, count: 15 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one denomination is required' })
  @ValidateNested({ each: true })
  @Type(() => DenominationDto)
  denominations: DenominationDto[];
}

export class CloseSessionDto {
  @ApiProperty({
    description: 'POS Session ID to close',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Closing cash amount in the counter (calculated from denominations if provided)',
    example: 12500.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  closingCash: number;

  @ApiPropertyOptional({
    description: 'Denomination-wise closing cash drawer entry',
    type: ClosingCashDrawerDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClosingCashDrawerDto)
  closingCashDrawer?: ClosingCashDrawerDto;

  @ApiPropertyOptional({
    description: 'Optional remarks for closing the session',
    example: 'End of day shift',
  })
  @IsString()
  @IsOptional()
  closingNotes?: string;
}

