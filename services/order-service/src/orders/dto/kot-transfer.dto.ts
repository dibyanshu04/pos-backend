import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransferItemDto {
  @ApiProperty({
    description: 'Order Item ID to transfer (from KOT item.orderItemId)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @ApiProperty({
    description: 'Quantity to transfer',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  quantity: number;
}

export class KotTransferDto {
  @ApiProperty({
    description: 'Items to transfer to another kitchen',
    type: [TransferItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferItemDto)
  items: TransferItemDto[];

  @ApiProperty({
    description: 'Destination kitchen ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  toKitchenId: string;

  @ApiProperty({
    description: 'Reason for transferring the KOT items',
    example: 'Sent to wrong kitchen - item belongs to bar kitchen',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Reason must be at least 3 characters long' })
  reason: string;
}

