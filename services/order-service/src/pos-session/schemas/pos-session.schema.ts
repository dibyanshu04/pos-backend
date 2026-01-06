import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PosSessionDocument = PosSession & Document;

// Payment Summary Subdocument
@Schema({ _id: false })
export class PaymentSummary {
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
}

export const PaymentSummarySchema = SchemaFactory.createForClass(PaymentSummary);

// Denomination Subdocument
@Schema({ _id: false })
export class Denomination {
  @Prop({ type: Number, required: true })
  value: number; // Denomination value (e.g., 500, 100, 50)

  @Prop({ type: Number, required: true, min: 0 })
  count: number; // Number of notes/coins

  @Prop({ type: Number, required: true, min: 0 })
  amount: number; // Calculated: value * count
}

export const DenominationSchema = SchemaFactory.createForClass(Denomination);

// Opening Cash Drawer Subdocument
@Schema({ _id: false })
export class OpeningCashDrawer {
  @Prop({ type: [DenominationSchema], default: [] })
  denominations: Denomination[];

  @Prop({ type: Number, default: 0, min: 0 })
  totalOpeningCash: number;
}

export const OpeningCashDrawerSchema =
  SchemaFactory.createForClass(OpeningCashDrawer);

// Closing Cash Drawer Subdocument
@Schema({ _id: false })
export class ClosingCashDrawer {
  @Prop({ type: [DenominationSchema], default: [] })
  denominations: Denomination[];

  @Prop({ type: Number, default: 0, min: 0 })
  totalClosingCash: number;
}

export const ClosingCashDrawerSchema =
  SchemaFactory.createForClass(ClosingCashDrawer);

// Cash Drawer Subdocument
@Schema({ _id: false })
export class CashDrawer {
  @Prop({ type: OpeningCashDrawerSchema, required: false })
  opening?: OpeningCashDrawer;

  @Prop({ type: ClosingCashDrawerSchema, required: false })
  closing?: ClosingCashDrawer;
}

export const CashDrawerSchema = SchemaFactory.createForClass(CashDrawer);

@Schema({ timestamps: true })
export class PosSession {
  // Session Identification
  @Prop({ type: String, required: true, unique: true, index: true })
  sessionNumber: string; // Sequential number per outlet per day (e.g., "SESS-2024-01-15-001")

  // Restaurant and Outlet References
  @Prop({ type: String, required: true, index: true })
  restaurantId: string;

  @Prop({ type: String, required: true, index: true })
  outletId: string;

  // Opening Information
  @Prop({ type: String, required: true, index: true })
  openedByUserId: string; // Reference to auth-service user

  @Prop({ type: Date, required: true, default: Date.now })
  openedAt: Date;

  @Prop({ type: Number, required: true, min: 0 })
  openingCash: number;

  @Prop({ type: String })
  openingNotes?: string;

  // Closing Information
  @Prop({ type: String, index: true })
  closedByUserId?: string; // Reference to auth-service user

  @Prop({ type: Date })
  closedAt?: Date;

  @Prop({ type: Number, min: 0 })
  closingCash?: number;

  @Prop({ type: String })
  closingNotes?: string;

  // Financial Calculations
  @Prop({ type: Number, default: 0, min: 0 })
  expectedCash: number; // openingCash + cash payments collected

  @Prop({ type: Number, default: 0 })
  cashDifference: number; // closingCash - expectedCash

  @Prop({
    type: String,
    enum: ['SHORT', 'EXACT', 'EXCESS'],
    default: 'EXACT',
  })
  cashStatus: 'SHORT' | 'EXACT' | 'EXCESS';

  // Session Statistics
  @Prop({ type: Number, default: 0, min: 0 })
  totalOrders: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalSales: number; // Total sales amount

  // Payment Summary
  @Prop({ type: PaymentSummarySchema, default: () => ({}) })
  paymentSummary: PaymentSummary;

  // Cash Drawer (Denomination-wise tracking)
  @Prop({ type: CashDrawerSchema })
  cashDrawer?: CashDrawer;

  // Cash Refunds (for expected cash calculation)
  @Prop({ type: Number, default: 0, min: 0 })
  cashRefunds: number; // Total cash refunds during session

  // Session Status
  @Prop({
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN',
    required: true,
    index: true,
  })
  status: 'OPEN' | 'CLOSED';

  // Z-Report Reference (immutable after generation)
  @Prop({ type: Types.ObjectId, ref: 'DayEndReport', index: true })
  zReportId?: Types.ObjectId; // Reference to Z-Report if generated
}

export const PosSessionSchema = SchemaFactory.createForClass(PosSession);

// Indexes for better query performance
PosSessionSchema.index({ outletId: 1, status: 1 }); // For finding active session
PosSessionSchema.index({ restaurantId: 1, outletId: 1, createdAt: -1 }); // For listing sessions
PosSessionSchema.index({ openedByUserId: 1, createdAt: -1 }); // For staff-based queries
PosSessionSchema.index({ sessionNumber: 1 }); // Unique index already defined above

