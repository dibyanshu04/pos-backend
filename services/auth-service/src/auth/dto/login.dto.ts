import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserType } from 'src/users/schema/user.schema';

export class LoginDto {
  @ApiProperty({ example: 'dibyanshu@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: UserType, example: UserType.PLATFORM })
  @IsEnum(UserType)
  userType: UserType;
}
