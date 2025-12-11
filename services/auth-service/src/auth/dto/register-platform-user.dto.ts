import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterPlatformUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@pos.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber('IN')
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
