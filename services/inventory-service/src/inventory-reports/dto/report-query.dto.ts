import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ReportQueryDto {
  @ApiProperty({ description: 'Outlet ID (scope for reports)', example: 'outlet-123' })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiPropertyOptional({
    description: 'Start date (inclusive, ISO). If omitted, uses beginning of time.',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date (inclusive, ISO). If omitted, uses now.',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}

