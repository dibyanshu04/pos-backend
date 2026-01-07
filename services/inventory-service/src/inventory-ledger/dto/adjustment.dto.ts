import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, NotEquals } from 'class-validator';

export class AdjustmentDto {
  @ApiProperty({
    description: 'Raw material ID (must be active and outlet-scoped)',
    example: '64f0c9a2b7d3c2f1a1234567',
  })
  @IsMongoId()
  @IsNotEmpty()
  rawMaterialId: string;

  @ApiProperty({
    description: 'Quantity change in base unit. Positive = stock in, Negative = stock out. Must be non-zero.',
    example: -200,
  })
  @IsNumber()
  @NotEquals(0, { message: 'quantityChange cannot be zero' })
  quantityChange: number;

  @ApiPropertyOptional({
    description: 'Remarks for audit trail',
    example: 'Manual correction after physical count',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

