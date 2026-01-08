import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DayEndReportDocument = DayEndReport & Document;

// Category Profit Snapshot (optional)
@Schema({ _id: false })
export class CategoryProfitSnapshot {
  @Prop({ type: String, required: true })
  categoryId: string;

  @Prop({ type: String, required: true })
  categoryName: string;

  @Prop({ type: Number, required: true, default: 0 })
  sales: number;

  @Prop({ type: Number, required: true, default: 0 })
  cogs: number;

  @Prop({ type: Number, required: true, default: 0 })
  profit: number;
}

export const CategoryProfitSnapshotSchema =
  SchemaFactory.createForClass(CategoryProfitSnapshot);

// Staff Summary Subdocument
@Schema({ _id: false })
export class StaffSummary {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({
    type: String,
    required: true,
    enum: ['OWNER', 'MANAGER', 'CASHIER', 'WAITER', 'CHEF'],
  })
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'CHEF';

  @Prop({ type: String, required: true })
  shiftId: string;

  @Prop({ type: Number, default: 0, min: 0 })
  totalOrders: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalSales: number;

  @Prop({ type: Number, default: 0, min: 0 })
  cashCollected: number;
}

export const StaffSummarySchema = SchemaFactory.createForClass(StaffSummary);

// Payment Summary Subdocument (same as POS Session)
@Schema({ _id: false })
export class ReportPaymentSummary {
  @Prop({ type: Number, default: 0, min: 0 })
  CASH: number;

  @Prop({ type: Number, default: 0, min: 0 })
  CARD: number;

  @Prop({ type: Number, default: 0, min: 0 })
  UPI: number;

  @Prop({ type: Number, default: 0, min: 0 })
  WALLET: number;

  @Prop({ type: Number, default: 0, min: 0 })
  NET_BANKING: number;

  @Prop({ type: Number, default: 0, min: 0 })
  OTHER: number;

  @Prop({ type: Number, default: 0, min: 0 })
  CREDIT: number;
}

export const ReportPaymentSummarySchema =
  SchemaFactory.createForClass(ReportPaymentSummary);

@Schema({ timestamps: true })
export class DayEndReport {
  // Restaurant and Outlet References
  @Prop({ type: String, required: true, index: true })
  restaurantId: string;

  @Prop({ type: String, required: true, index: true })
  outletId: string;

  // POS Session Reference
  @Prop({
    type: Types.ObjectId,
    ref: 'PosSession',
    required: true,
    unique: true,
    index: true,
  })
  posSessionId: Types.ObjectId; // One Z-Report per session

  // Report Type (only Z-Report is stored, X-Report is computed)
  @Prop({
    type: String,
    enum: ['Z'],
    default: 'Z',
    required: true,
  })
  reportType: 'Z';

  // Cash Information
  @Prop({ type: Number, required: true, min: 0 })
  openingCash: number;

  @Prop({ type: Number, required: true, min: 0 })
  closingCash: number;

  @Prop({ type: Number, required: true, min: 0 })
  expectedCash: number;

  @Prop({ type: Number, required: true })
  cashDifference: number; // closingCash - expectedCash

  @Prop({
    type: String,
    enum: ['SHORT', 'EXACT', 'EXCESS'],
    required: true,
  })
  cashStatus: 'SHORT' | 'EXACT' | 'EXCESS';

  // Financial Summary
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalOrders: number;

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalSales: number;

  // Petpooja Profit & Margin Snapshot (immutable)
  @Prop({ type: Number, required: true, default: 0, min: 0, immutable: true })
  totalGrossSales: number; // before discounts

  @Prop({ type: Number, required: true, default: 0, min: 0, immutable: true })
  totalDiscounts: number;

  @Prop({ type: Number, required: true, default: 0, min: 0, immutable: true })
  netSales: number; // after discounts and round-off

  @Prop({ type: Number, required: true, default: 0, min: 0, immutable: true })
  totalCOGS: number; // sum of order.bill.totalCOGS (snapshot)

  @Prop({ type: Number, required: true, default: 0, immutable: true })
  grossProfit: number; // netSales - totalCOGS (can be negative)

  @Prop({ type: Number, required: true, default: 0, immutable: true })
  grossMarginPercent: number; // (grossProfit / netSales) * 100, rounded

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalDiscount: number;

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalTax: number;

  // Complimentary Items Summary
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalComplimentaryItemsValue: number; // Total value of complimentary items (for reporting)

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalComplimentaryItemsCount: number; // Count of complimentary items

  // Void Bills Summary
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalVoidedBills: number; // Count of voided bills

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalVoidedAmount: number; // Total amount of voided bills (for reporting)

  // Credit Bills Summary
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalCreditBills: number; // Count of credit bills

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalCreditOutstanding: number; // Outstanding credit amount (unsettled)

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  totalCreditSettled: number; // Credit amount settled during this session

  // Payment Summary
  @Prop({ type: ReportPaymentSummarySchema, required: true })
  paymentSummary: ReportPaymentSummary;

  // Category-wise profit snapshot (optional)
  @Prop({ type: [CategoryProfitSnapshotSchema], default: [], immutable: true })
  categoryWise?: CategoryProfitSnapshot[];

  // Staff Summary (snapshot of all shifts in session)
  @Prop({ type: [StaffSummarySchema], default: [] })
  staffSummary: StaffSummary[];

  // Business day snapshot (outlet local start-of-day)
  @Prop({ type: Date, required: true, immutable: true, index: true })
  businessDay: Date;

  // Generation Information
  @Prop({ type: String, required: true, index: true })
  generatedByUserId: string; // User who generated the report

  @Prop({ type: Date, required: true, default: Date.now })
  generatedAt: Date;

  // Additional metadata
  @Prop({ type: String })
  notes?: string;
}

export const DayEndReportSchema = SchemaFactory.createForClass(DayEndReport);

// Indexes for better query performance
DayEndReportSchema.index({ outletId: 1, generatedAt: -1 }); // For listing reports by outlet
DayEndReportSchema.index({ restaurantId: 1, generatedAt: -1 }); // For listing reports by restaurant
DayEndReportSchema.index({ posSessionId: 1 }); // Unique index already defined above
DayEndReportSchema.index({ generatedByUserId: 1, generatedAt: -1 }); // For user-based queries
DayEndReportSchema.index({ outletId: 1, businessDay: 1 }); // For enforcing one report per outlet-day

