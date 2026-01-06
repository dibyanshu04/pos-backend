import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CancelItemDto {
  @ApiProperty({
    description: 'Order Item ID to cancel (from KOT item.orderItemId)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @ApiProperty({
    description: 'Quantity to cancel',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  quantity: number;
}

export class KotCancelDto {
  @ApiPropertyOptional({
    description: 'Specific items to cancel (for partial cancellation). If not provided, cancels entire KOT.',
    type: [CancelItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancelItemDto)
  items?: CancelItemDto[];

  @ApiProperty({
    description: 'Reason for cancelling the KOT',
    example: 'Wrong order - customer changed mind',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Reason must be at least 3 characters long' })
  reason: string;
}

