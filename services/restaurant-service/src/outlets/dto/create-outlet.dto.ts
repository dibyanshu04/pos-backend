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
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class OutletLocationDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty({ default: 'India' })
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  zipCode: string;
}

class OutletTimingDto {
  @ApiProperty({
    description: 'Opening time in HH:MM format',
    example: '09:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format. Use HH:MM',
  })
  openingTime: string;

  @ApiProperty({
    description: 'Closing time in HH:MM format',
    example: '23:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format. Use HH:MM',
  })
  closingTime: string;

  @ApiProperty({ description: 'Timezone', example: 'Asia/Kolkata' })
  @IsString()
  timezone: string;

  @ApiProperty({
    description: 'Working days',
    example: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  workingDays: string[];
}

class OutletFacilitiesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  tableCount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  seatingCapacity?: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  hasDelivery: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  hasTakeaway: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  hasDineIn: boolean;
}

export class CreateOutletDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsString()
  restaurantId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OutletLocationDto)
  location: OutletLocationDto;

  @ApiProperty()
  @IsPhoneNumber('IN')
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OutletTimingDto)
  timing: OutletTimingDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OutletFacilitiesDto)
  facilities: OutletFacilitiesDto;

  @ApiProperty({
    required: false,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  managerContact?: string;
}
