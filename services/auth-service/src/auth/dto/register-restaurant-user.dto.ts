import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class RestaurantAccessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  outletId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleId: string;
}

export class RegisterRestaurantUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({ type: [RestaurantAccessDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestaurantAccessDto)
  restaurantAccess: RestaurantAccessDto[];
}
