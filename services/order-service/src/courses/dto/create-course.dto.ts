import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Restaurant ID',
    example: 'restaurant123',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Outlet ID',
    example: 'outlet456',
  })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({
    description: 'Course name',
    example: 'Starter',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Course code (unique per outlet)',
    example: 'STARTER',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Serving sequence (1 = first, 2 = second, etc.)',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  sequence: number;

  @ApiProperty({
    description: 'Whether this is the default course for the outlet',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Whether the course is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

