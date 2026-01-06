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
  IsIn,
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

  @ApiProperty({
    required: false,
    description: 'Billing configuration for round-off settings',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingConfigDto)
  billingConfig?: BillingConfigDto;
}

class RoundOffConfigDto {
  @ApiProperty({
    description: 'Enable/disable round-off',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    description: 'Rounding method',
    enum: ['NEAREST', 'UP', 'DOWN'],
    default: 'NEAREST',
  })
  @IsOptional()
  @IsString()
  @IsIn(['NEAREST', 'UP', 'DOWN'])
  method?: 'NEAREST' | 'UP' | 'DOWN';

  @ApiProperty({
    description: 'Rounding precision (₹0.05, ₹0.10, or ₹1.00)',
    enum: [0.05, 0.1, 1.0],
    default: 0.05,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0.05, 0.1, 1.0])
  precision?: 0.05 | 0.1 | 1.0;
}

class BillingConfigDto {
  @ApiProperty({
    type: RoundOffConfigDto,
    description: 'Round-off configuration',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoundOffConfigDto)
  roundOff?: RoundOffConfigDto;
}
