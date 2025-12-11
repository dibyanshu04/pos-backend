import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRestaurantDto } from '../../restaurants/dto/create-restaurant.dto';

class OwnerDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsPhoneNumber('IN')
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateOnboardingDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateRestaurantDto)
  restaurantData: CreateRestaurantDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OwnerDataDto)
  ownerData: OwnerDataDto;

  @ApiProperty({
    description: 'Subscription plan ID for trial',
    required: false,
  })
  @IsOptional()
  @IsString()
  subscriptionPlanId?: string;
}
