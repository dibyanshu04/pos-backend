import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class MarkComplimentaryDto {
  @ApiProperty({
    description: 'Order item ID to mark as complimentary',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @ApiProperty({
    description: 'Reason for making item complimentary (mandatory)',
    example: 'Customer complaint - free dessert',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

