import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VoidBillDto {
  @ApiProperty({
    description: 'Reason for voiding the bill (mandatory)',
    example: 'Customer cancelled order',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class VoidBillResponseDto {
  orderId: string;
  billNumber?: string;
  voidedAt: Date;
  voidedByUserId: string;
  voidReason: string;
  originalBillAmount: number;
  status: 'VOIDED';
}

