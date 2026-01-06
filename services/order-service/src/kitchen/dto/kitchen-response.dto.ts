import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KitchenResponseDto {
  @ApiProperty({ description: 'Kitchen ID' })
  _id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  restaurantId: string;

  @ApiProperty({ description: 'Outlet ID' })
  outletId: string;

  @ApiProperty({ description: 'Kitchen name' })
  name: string;

  @ApiProperty({ description: 'Kitchen code' })
  code: string;

  @ApiProperty({ description: 'Whether this is the default kitchen' })
  isDefault: boolean;

  @ApiProperty({ description: 'Whether the kitchen is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Printer ID' })
  printerId?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

