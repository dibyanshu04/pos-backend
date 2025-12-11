import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class IncrementUsageDto {
  @ApiProperty({
    description: 'Usage type to increment',
    enum: ['orders', 'menuItems', 'outlets'],
  })
  @IsEnum(['orders', 'menuItems', 'outlets'])
  type: 'orders' | 'menuItems' | 'outlets';

  @ApiProperty({
    description: 'Count to increment',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  count?: number;

  @ApiProperty({
    description: 'Restaurant ID (if not in path)',
    required: false,
  })
  @IsOptional()
  @IsString()
  restaurantId?: string;
}
