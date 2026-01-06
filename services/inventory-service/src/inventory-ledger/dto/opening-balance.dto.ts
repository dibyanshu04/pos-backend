import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpeningBalanceDto {
  @ApiProperty({
    description: 'Raw material ID (must be active and outlet-scoped)',
    example: '64f0c9a2b7d3c2f1a1234567',
  })
  @IsMongoId()
  @IsNotEmpty()
  rawMaterialId: string;

  @ApiProperty({
    description: 'Opening quantity in purchase unit converted to base unit via conversionFactor; must be positive.',
    example: 5000,
    minimum: 0.0001,
  })
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Remarks for audit trail',
    example: 'Initial stock on migration day',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

