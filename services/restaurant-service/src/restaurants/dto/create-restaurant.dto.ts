import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUrl,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @ApiProperty({ description: 'Full address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Country', default: 'India' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'ZIP/Postal code' })
  @IsString()
  zipCode: string;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

class RestaurantDetailsDto {
  @ApiProperty({ description: 'Cuisine types', type: [String] })
  @IsArray()
  @IsString({ each: true })
  cuisine: string[];

  @ApiProperty({ description: 'Seating capacity', required: false })
  @IsOptional()
  @IsNumber()
  seatingCapacity?: number;

  @ApiProperty({
    description: 'Has outdoor seating',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasOutdoorSeating?: boolean;

  @ApiProperty({
    description: 'Has parking facility',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasParking?: boolean;

  @ApiProperty({
    description: 'Is pure vegetarian restaurant',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVegOnly?: boolean;

  @ApiProperty({
    description: 'Is non-vegetarian restaurant',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isNonVegOnly?: boolean;
}

class BusinessInfoDto {
  @ApiProperty({ description: 'GSTIN number', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GSTIN format',
  })
  gstin?: string;

  @ApiProperty({ description: 'FSSAI license number', required: false })
  @IsOptional()
  @IsString()
  fssaiLicense?: string;

  @ApiProperty({ description: 'PAN number', required: false })
  @IsOptional()
  @IsString()
  @Matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, {
    message: 'Invalid PAN format',
  })
  panNumber?: string;
}

export class CreateRestaurantDto {
  @ApiProperty({ description: 'Restaurant name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL-friendly restaurant identifier' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiProperty({ description: 'Owner full name' })
  @IsString()
  ownerName: string;

  @ApiProperty({ description: 'Restaurant contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Restaurant contact phone number' })
  @IsPhoneNumber('IN', { message: 'Invalid Indian phone number' })
  phone: string;

  @ApiProperty({ description: 'Restaurant location details' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({
    description: 'Restaurant details and features',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RestaurantDetailsDto)
  details?: RestaurantDetailsDto;

  @ApiProperty({
    description: 'Business registration information',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessInfoDto)
  businessInfo?: BusinessInfoDto;

  @ApiProperty({
    description: 'Restaurant status',
    enum: ['active', 'inactive', 'suspended', 'onboarding'],
    default: 'onboarding',
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended', 'onboarding'])
  status?: string;

  @ApiProperty({ description: 'Restaurant logo URL', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ description: 'Restaurant website', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Total number of outlets',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  totalOutlets?: number;
}
