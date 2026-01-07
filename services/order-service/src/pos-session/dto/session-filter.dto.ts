import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SessionFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by outlet ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  outletId?: string;

  @ApiPropertyOptional({
    description: 'Filter by restaurant ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  restaurantId?: string;

  @ApiPropertyOptional({
    description: 'Filter by staff user ID who opened the session',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  openedByUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter by session status',
    example: 'OPEN',
    enum: ['OPEN', 'CLOSED'],
  })
  @IsString()
  @IsOptional()
  status?: 'OPEN' | 'CLOSED';

  @ApiPropertyOptional({
    description: 'Start date for date range filter (ISO 8601)',
    example: '2024-01-15T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for date range filter (ISO 8601)',
    example: '2024-01-15T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

