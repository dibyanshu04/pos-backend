import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiProperty({
    description: 'Start date for analytics (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for analytics (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Plan ID to filter analytics',
    required: false,
  })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({
    description: 'Group by period',
    enum: ['day', 'week', 'month', 'year'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  groupBy?: string;
}
