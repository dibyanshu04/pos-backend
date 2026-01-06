import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateKitchenDto {
  @ApiProperty({
    description: 'Restaurant ID',
    example: 'restaurant-123',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Outlet ID',
    example: 'outlet-456',
  })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({
    description: 'Kitchen name',
    example: 'Main Kitchen',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Kitchen code (unique per outlet)',
    example: 'MAIN_KITCHEN',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({
    description: 'Whether this is the default kitchen for the outlet',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the kitchen is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Printer ID for future use',
  })
  @IsOptional()
  @IsString()
  printerId?: string;
}

