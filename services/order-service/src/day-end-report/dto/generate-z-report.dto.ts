import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateZReportDto {
  @ApiProperty({
    description: 'Outlet ID for which to generate Z-Report',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiPropertyOptional({
    description: 'Optional notes for the Z-Report',
    example: 'Day end settlement completed',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

