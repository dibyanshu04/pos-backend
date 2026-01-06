import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  // Restaurant and Table References
  @Prop({ required: true, type: String, index: true })
  restaurantId: string; // Reference to restaurant-service

  @Prop({ type: Types.ObjectId, ref: 'Table', index: true })
  tableId?: Types.ObjectId; // Reference to restaurant-service table module

  @Prop({ type: String, index: true })
  waiterId?: string; // Reference to auth-service user (waiter)

  // POS Session Reference
  @Prop({ type: Types.ObjectId, ref: 'PosSession', index: true })
  posSessionId?: Types.ObjectId; // Reference to active POS session

  // Customer Information
  @Prop({ type: String })
  customerPhone?: string; // Optional customer phone number

  @Prop({ type: String, index: true })
  customerId?: string; // Optional customer ID reference

  // Order Status
  @Prop({
    type: String,
    enum: ['DRAFT', 'KOT_PRINTED', 'BILLED', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
    required: true,
    index: true,
  })
  status: 'DRAFT' | 'KOT_PRINTED' | 'BILLED' | 'COMPLETED' | 'CANCELLED';

  // Order Type
  @Prop({
    type: String,
    enum: ['DINE_IN', 'TAKEAWAY'],
    required: true,
    index: true,
  })
  orderType: 'DINE_IN' | 'TAKEAWAY';

  // Bill Number (unique sequential)
  @Prop({ type: String, unique: true, sparse: true, index: true })
  billNumber?: string; // Unique sequential bill number (generated when billing)

  // Financial Summaries
  @Prop({ type: Number, required: true, default: 0, min: 0 })
  subtotal: number; // Sum of all item prices before tax and discount

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  tax: number; // Total tax amount

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  discount: number; // Total discount amount

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  total: number; // Final total (subtotal + tax - discount)

  // Additional metadata
  @Prop({ type: String })
  notes?: string; // Order notes/comments

  // KOT References (One order can have multiple KOTs - one per kitchen)
  @Prop({ type: [Types.ObjectId], ref: 'KOT', default: [] })
  kotIds: Types.ObjectId[]; // Array of KOT IDs generated for this order

  @Prop({ type: Date })
  kotPrintedAt?: Date; // Timestamp when KOT was first printed

  @Prop({ type: Date })
  billedAt?: Date; // Timestamp when order was billed

  @Prop({ type: Date })
  completedAt?: Date; // Timestamp when order was completed
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for better query performance
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ restaurantId: 1, tableId: 1, status: 1 });
OrderSchema.index({ restaurantId: 1, waiterId: 1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });
OrderSchema.index({ billNumber: 1 });
