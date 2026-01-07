import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';

export class SettleCreditDto {
  @ApiProperty({
    description: 'Payment method for settling the credit bill',
    enum: ['CASH', 'CARD', 'UPI', 'WALLET', 'NET_BANKING', 'CHEQUE', 'OTHER'],
    example: 'CASH',
  })
  @IsEnum(['CASH', 'CARD', 'UPI', 'WALLET', 'NET_BANKING', 'CHEQUE', 'OTHER'])
  @IsNotEmpty()
  method: 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING' | 'CHEQUE' | 'OTHER';

  @ApiProperty({
    description: 'Amount to settle (must match outstanding credit amount)',
    example: 1200,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Transaction ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({
    description: 'Reference number (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({
    description: 'Notes (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SettleCreditResponseDto {
  paymentId: string;
  originalCreditPaymentId: string;
  orderId: string;
  settlementPaymentId: string;
  amount: number;
  method: string;
  settledAt: Date;
}

