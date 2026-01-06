import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GrnItemDto {
  @ApiProperty({
    description: 'Raw material ID (must be active & outlet-scoped)',
    example: '64f0c9a2b7d3c2f1a1234567',
  })
  @IsMongoId()
  @IsNotEmpty()
  rawMaterialId: string;

  @ApiProperty({
    description: 'Purchase quantity in PURCHASE UNIT. Will be converted to base unit internally.',
    example: 2,
    minimum: 0.0001,
  })
  @IsNumber()
  @Min(0.0001)
  purchaseQuantity: number;

  @ApiProperty({
    description: 'Unit cost per PURCHASE UNIT. Converted to base-unit cost internally.',
    example: 400,
    minimum: 0.0001,
  })
  @IsNumber()
  @Min(0.0001)
  unitCost: number;
}

export class CreateGrnDto {
  @ApiProperty({ description: 'Restaurant ID', example: 'restaurant-123' })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ description: 'Outlet ID', example: 'outlet-456' })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({
    description: 'Vendor ID (must be active & outlet-scoped)',
    example: '64f0c9a2b7d3c2f1a99999999',
  })
  @IsMongoId()
  @IsNotEmpty()
  vendorId: string;

  @ApiPropertyOptional({
    description: 'Invoice number (optional). Duplicate prevention is best-effort.',
    example: 'INV-123',
  })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({
    description: 'Invoice date (optional, ISO string)',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @ApiProperty({
    type: [GrnItemDto],
    description:
      'List of GRN items. purchaseQuantity & unitCost are in purchase unit; conversion to base unit is automatic.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GrnItemDto)
  items: GrnItemDto[];

  @ApiPropertyOptional({
    description: 'Audit user ID creating GRN',
    example: 'user-1',
  })
  @IsOptional()
  @IsString()
  createdByUserId?: string;
}

