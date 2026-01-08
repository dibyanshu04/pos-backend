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

export class ZReportCategoryProfitDto {
  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Category name snapshot' })
  categoryName: string;

  @ApiProperty({ description: 'Sales for the category (snapshot, after discounts)' })
  sales: number;

  @ApiProperty({ description: 'COGS for the category (snapshot)' })
  cogs: number;

  @ApiProperty({ description: 'Profit (sales - COGS) for the category' })
  profit: number;
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

  @ApiProperty({
    description:
      'Legacy total sales (alias of net sales snapshot from stored netPayable for completed, non-voided orders in the business day)',
  })
  totalSales: number;

  @ApiProperty({
    description:
      'Total gross sales before discounts (snapshot from order.grossAmount for completed, non-voided orders in the business day)',
    example: 12500.75,
  })
  totalGrossSales: number;

  @ApiProperty({
    description:
      'Total discounts applied (snapshot from order.discount for completed, non-voided orders in the business day)',
    example: 350.5,
  })
  totalDiscounts: number;

  @ApiProperty({
    description:
      'Net sales after discounts and round-off (snapshot from order.netPayable for completed, non-voided orders in the business day)',
    example: 12150.25,
  })
  netSales: number;

  @ApiProperty({
    description:
      'Total COGS (sum of stored order.totalCOGS snapshot for completed, non-voided orders in the business day)',
    example: 4800.35,
  })
  totalCOGS: number;

  @ApiProperty({
    description:
      'Gross profit = netSales - totalCOGS (snapshot, no recomputation)',
    example: 7350.9,
  })
  grossProfit: number;

  @ApiProperty({
    description:
      'Gross margin % = (grossProfit / netSales) * 100, rounded to 2 decimals',
    example: 60.5,
  })
  grossMarginPercent: number;

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

  @ApiProperty({
    description: 'Optional category-wise profit snapshot',
    type: [ZReportCategoryProfitDto],
    required: false,
  })
  categoryWise?: ZReportCategoryProfitDto[];

  @ApiProperty({ description: 'Staff shift summaries', type: [ZReportStaffSummaryDto] })
  staffSummary: ZReportStaffSummaryDto[];

  @ApiProperty({ description: 'User who generated the report' })
  generatedByUserId: string;

  @ApiProperty({
    description:
      'Business day (outlet local start-of-day) this Z-Report covers',
  })
  businessDay: Date;

  @ApiProperty({ description: 'Report generated at' })
  generatedAt: Date;

  @ApiPropertyOptional({ description: 'Report notes' })
  notes?: string;
}

