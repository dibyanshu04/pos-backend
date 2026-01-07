import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StaffShiftSummaryDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Role at shift start' })
  role: string;

  @ApiProperty({ description: 'Shift ID' })
  shiftId: string;

  @ApiProperty({ description: 'Total orders handled' })
  totalOrders: number;

  @ApiProperty({ description: 'Total sales' })
  totalSales: number;

  @ApiProperty({ description: 'Cash collected' })
  cashCollected: number;
}

export class XReportResponseDto {
  @ApiProperty({ description: 'POS Session ID' })
  posSessionId: string;

  @ApiProperty({ description: 'Session number' })
  sessionNumber: string;

  @ApiProperty({ description: 'Restaurant ID' })
  restaurantId: string;

  @ApiProperty({ description: 'Outlet ID' })
  outletId: string;

  @ApiProperty({ description: 'Report generated at' })
  generatedAt: Date;

  @ApiProperty({ description: 'Opening cash amount' })
  openingCash: number;

  @ApiProperty({ description: 'Expected cash (opening + cash sales - cash refunds)' })
  expectedCash: number;

  @ApiProperty({ description: 'Total number of orders' })
  totalOrders: number;

  @ApiProperty({ description: 'Total sales amount' })
  totalSales: number;

  @ApiProperty({ description: 'Total discount amount' })
  totalDiscount: number;

  @ApiProperty({ description: 'Total tax amount' })
  totalTax: number;

  @ApiProperty({ description: 'Payment summary breakdown' })
  paymentSummary: {
    CASH: number;
    CARD: number;
    UPI: number;
    WALLET: number;
    NET_BANKING: number;
    OTHER: number;
  };

  @ApiProperty({ description: 'Total cash refunds' })
  cashRefunds: number;

  @ApiPropertyOptional({ description: 'Staff shift summaries', type: [StaffShiftSummaryDto] })
  staffSummary?: StaffShiftSummaryDto[];

  @ApiProperty({ description: 'Session opened at' })
  openedAt: Date;

  @ApiProperty({ description: 'Session duration in minutes' })
  duration: number;
}

