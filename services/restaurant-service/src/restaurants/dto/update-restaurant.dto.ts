import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class UpdateLocationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zipCode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude: number;
}

class UpdateRestaurantDetailsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ each: true })
  cuisine: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  seatingCapacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasOutdoorSeating?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasParking?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isVegOnly?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isNonVegOnly?: boolean;
}

class UpdateBusinessInfoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fssaiLicense?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  panNumber?: string;
}

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  location?: UpdateLocationDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  details?: UpdateRestaurantDetailsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  businessInfo?: UpdateBusinessInfoDto;

  @ApiProperty({
    required: false,
    enum: ['active', 'inactive', 'suspended', 'onboarding'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended', 'onboarding'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalOutlets?: number;

  @ApiProperty({
    description: 'Current subscription ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentSubscription?: string;
}
