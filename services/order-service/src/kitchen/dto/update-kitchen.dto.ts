import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateKitchenDto {
  @ApiPropertyOptional({
    description: 'Kitchen name',
    example: 'Main Kitchen',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Kitchen code',
    example: 'MAIN_KITCHEN',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the default kitchen',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the kitchen is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Printer ID',
  })
  @IsOptional()
  @IsString()
  printerId?: string;
}

