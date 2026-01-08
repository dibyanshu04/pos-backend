import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  Min,
} from 'class-validator';

export class SettleOrderDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(['CASH', 'CARD', 'UPI', 'WALLET', 'NET_BANKING', 'CHEQUE', 'CREDIT', 'OTHER'])
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING' | 'CHEQUE' | 'CREDIT' | 'OTHER';

  @IsNumber()
  @Min(0)
  amount: number;

  // Optional fields for payment details
  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  gatewayName?: string;

  @IsString()
  @IsOptional()
  gatewayTransactionId?: string;

  // Card-specific fields
  @IsString()
  @IsOptional()
  cardLastFour?: string;

  @IsString()
  @IsOptional()
  cardType?: string;

  // UPI-specific fields
  @IsString()
  @IsOptional()
  upiId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SettleOrderResponseDto {
  orderId: string;
  paymentId: string;
  billNumber?: string;
  paymentMethod: string;
  amount: number;
  status: string;
  orderStatus: string;
  settledAt: Date;
  totalCOGS?: number;
}
