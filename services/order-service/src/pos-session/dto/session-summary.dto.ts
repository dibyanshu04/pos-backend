import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DenominationSummaryDto {
  @ApiProperty({ description: 'Denomination value', example: 500 })
  value: number;

  @ApiProperty({ description: 'Number of notes/coins', example: 10 })
  count: number;

  @ApiProperty({ description: 'Calculated amount (value * count)', example: 5000 })
  amount: number;
}

export class CashDrawerSummaryDto {
  @ApiPropertyOptional({
    description: 'Opening cash drawer denominations',
    type: [DenominationSummaryDto],
  })
  opening?: {
    denominations: DenominationSummaryDto[];
    totalOpeningCash: number;
  };

  @ApiPropertyOptional({
    description: 'Closing cash drawer denominations',
    type: [DenominationSummaryDto],
  })
  closing?: {
    denominations: DenominationSummaryDto[];
    totalClosingCash: number;
  };
}

export class SessionSummaryDto {
  @ApiProperty({ description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Session number' })
  sessionNumber: string;

  @ApiProperty({ description: 'Restaurant ID' })
  restaurantId: string;

  @ApiProperty({ description: 'Outlet ID' })
  outletId: string;

  @ApiProperty({ description: 'Opening cash amount' })
  openingCash: number;

  @ApiProperty({ description: 'Closing cash amount' })
  closingCash?: number;

  @ApiProperty({ description: 'Expected cash amount (opening + cash sales - cash refunds)' })
  expectedCash: number;

  @ApiProperty({ description: 'Cash difference (closing - expected)' })
  cashDifference: number;

  @ApiProperty({ description: 'Cash status', enum: ['SHORT', 'EXACT', 'EXCESS'] })
  cashStatus: 'SHORT' | 'EXACT' | 'EXCESS';

  @ApiProperty({ description: 'Total cash refunds during session' })
  cashRefunds: number;

  @ApiProperty({ description: 'Total number of orders' })
  totalOrders: number;

  @ApiProperty({ description: 'Total sales amount' })
  totalSales: number;

  @ApiProperty({ description: 'Payment summary breakdown' })
  paymentSummary: {
    CASH: number;
    CARD: number;
    UPI: number;
    WALLET: number;
    NET_BANKING: number;
    OTHER: number;
  };

  @ApiPropertyOptional({ description: 'Cash drawer denomination breakdown', type: CashDrawerSummaryDto })
  cashDrawer?: CashDrawerSummaryDto;

  @ApiProperty({ description: 'Session status', enum: ['OPEN', 'CLOSED'] })
  status: 'OPEN' | 'CLOSED';

  @ApiProperty({ description: 'Session opened at' })
  openedAt: Date;

  @ApiProperty({ description: 'Session closed at' })
  closedAt?: Date;

  @ApiProperty({ description: 'User who opened the session' })
  openedByUserId: string;

  @ApiProperty({ description: 'User who closed the session' })
  closedByUserId?: string;

  @ApiProperty({ description: 'Session duration in minutes' })
  duration?: number; // in minutes
}

