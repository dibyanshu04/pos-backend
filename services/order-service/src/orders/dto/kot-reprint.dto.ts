import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class KotReprintDto {
  @ApiProperty({
    description: 'Reason for reprinting the KOT',
    example: 'Printer issue - kitchen missed the order',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Reason must be at least 3 characters long' })
  reason: string;
}

