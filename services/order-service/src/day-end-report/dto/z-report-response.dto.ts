import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ZReportStaffSummaryDto {
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

export class ZReportResponseDto {
  @ApiProperty({ description: 'Z-Report ID' })
  reportId: string;

  @ApiProperty({ description: 'POS Session ID' })
  posSessionId: string;

  @ApiProperty({ description: 'Session number' })
  sessionNumber: string;

  @ApiProperty({ description: 'Restaurant ID' })
  restaurantId: string;

  @ApiProperty({ description: 'Outlet ID' })
  outletId: string;

  @ApiProperty({ description: 'Report type', enum: ['Z'] })
  reportType: 'Z';

  @ApiProperty({ description: 'Opening cash amount' })
  openingCash: number;

  @ApiProperty({ description: 'Closing cash amount' })
  closingCash: number;

  @ApiProperty({ description: 'Expected cash (opening + cash sales - cash refunds)' })
  expectedCash: number;

  @ApiProperty({ description: 'Cash difference (closing - expected)' })
  cashDifference: number;

  @ApiProperty({ description: 'Cash status', enum: ['SHORT', 'EXACT', 'EXCESS'] })
  cashStatus: 'SHORT' | 'EXACT' | 'EXCESS';

  @ApiProperty({ description: 'Total number of orders' })
  totalOrders: number;

  @ApiProperty({ description: 'Total sales amount' })
  totalSales: number;

  @ApiProperty({ description: 'Total discount amount' })
  totalDiscount: number;

  @ApiProperty({ description: 'Total tax amount' })
  totalTax: number;

  @ApiProperty({ description: 'Total value of complimentary items (for reporting)' })
  totalComplimentaryItemsValue: number;

  @ApiProperty({ description: 'Total count of complimentary items' })
  totalComplimentaryItemsCount: number;

  @ApiProperty({ description: 'Total number of voided bills' })
  totalVoidedBills: number;

  @ApiProperty({ description: 'Total amount of voided bills (for reporting)' })
  totalVoidedAmount: number;

  @ApiProperty({ description: 'Total number of credit bills' })
  totalCreditBills: number;

  @ApiProperty({ description: 'Outstanding credit amount (unsettled)' })
  totalCreditOutstanding: number;

  @ApiProperty({ description: 'Credit amount settled during this session' })
  totalCreditSettled: number;

  @ApiProperty({ description: 'Payment summary breakdown' })
  paymentSummary: {
    CASH: number;
    CARD: number;
    UPI: number;
    WALLET: number;
    NET_BANKING: number;
    CREDIT: number;
    OTHER: number;
  };

  @ApiProperty({ description: 'Staff shift summaries', type: [ZReportStaffSummaryDto] })
  staffSummary: ZReportStaffSummaryDto[];

  @ApiProperty({ description: 'User who generated the report' })
  generatedByUserId: string;

  @ApiProperty({ description: 'Report generated at' })
  generatedAt: Date;

  @ApiPropertyOptional({ description: 'Report notes' })
  notes?: string;
}

