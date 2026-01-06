import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ description: 'Restaurant ID', example: 'restaurant-123' })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ description: 'Outlet ID', example: 'outlet-456' })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({ description: 'Vendor name', example: 'Fresh Farms Supplies' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Vendor phone', example: '+919876543210' })
  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @ApiPropertyOptional({ description: 'Vendor email', example: 'vendor@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Vendor GSTIN', example: '22AAAAA0000A1Z5' })
  @IsOptional()
  @IsString()
  gstin?: string;
}

