import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KotDocument = KOT & Document;

// KOT Item snapshot (items printed in this KOT batch)
@Schema({ _id: false })
export class KotItem {
  @Prop({ type: Types.ObjectId, ref: 'OrderItem', required: true })
  orderItemId: Types.ObjectId; // Reference to OrderItem

  @Prop({ type: String, required: true })
  itemName: string; // Snapshot of item name

  @Prop({ type: String })
  variantName?: string; // Snapshot of variant name

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number; // Quantity printed in this KOT

  @Prop({ type: String })
  specialInstructions?: string; // Special instructions for this item

  // Item status for audit trail (used in cancellation/transfer operations)
  @Prop({
    type: String,
    enum: ['ACTIVE', 'CANCELLED', 'TRANSFERRED'],
    default: 'ACTIVE',
  })
  status?: 'ACTIVE' | 'CANCELLED' | 'TRANSFERRED';
}

export const KotItemSchema = SchemaFactory.createForClass(KotItem);

@Schema({ timestamps: true })
export class KOT {
  // Order Reference (One-to-Many: Order -> KOTs)
  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  })
  orderId: Types.ObjectId;

  // Restaurant Reference
  @Prop({ type: String, required: true, index: true })
  restaurantId: string; // Reference to restaurant-service

  // Outlet Reference
  @Prop({ type: String, required: true, index: true })
  outletId: string; // Reference to outlet

  // Kitchen Reference
  @Prop({ type: Types.ObjectId, ref: 'Kitchen', required: true, index: true })
  kitchenId: Types.ObjectId; // Reference to Kitchen

  @Prop({ type: String, required: true })
  kitchenName: string; // Snapshot of kitchen name

  // Table Reference (for dine-in orders)
  @Prop({ type: Types.ObjectId, ref: 'Table', index: true })
  tableId?: Types.ObjectId; // Reference to restaurant-service table module

  // KOT Number (sequential per kitchen per day)
  @Prop({ type: String, required: true, index: true })
  kotNumber: string; // Sequential KOT number per kitchen (e.g., "KOT-001", "KOT-002")

  // Items printed in this KOT batch
  @Prop({ type: [KotItemSchema], required: true, default: [] })
  items: KotItem[]; // Snapshot of items printed in this KOT

  // KOT Type (NORMAL, REPRINT, CANCELLATION, TRANSFER)
  @Prop({
    type: String,
    enum: ['NORMAL', 'REPRINT', 'CANCELLATION', 'TRANSFER'],
    default: 'NORMAL',
    required: true,
    index: true,
  })
  type: 'NORMAL' | 'REPRINT' | 'CANCELLATION' | 'TRANSFER';

  // Parent KOT Reference (for REPRINT, CANCELLATION, TRANSFER operations)
  @Prop({ type: Types.ObjectId, ref: 'KOT', index: true })
  parentKotId?: Types.ObjectId; // Reference to original KOT

  // Action reason (mandatory for REPRINT, CANCELLATION, TRANSFER)
  @Prop({ type: String })
  actionReason?: string; // Reason for reprint/cancel/transfer

  // KOT Status
  @Prop({
    type: String,
    enum: ['PRINTED', 'CANCELLED'],
    default: 'PRINTED',
    required: true,
    index: true,
  })
  status: 'PRINTED' | 'CANCELLED';

  // Print Information
  @Prop({ type: Date, default: Date.now })
  printedAt: Date; // Timestamp when KOT was printed

  @Prop({ type: String })
  printedBy?: string; // User ID who printed the KOT

  // Cancellation Information
  @Prop({ type: Date })
  cancelledAt?: Date; // Timestamp when KOT was cancelled

  @Prop({ type: String })
  cancelledByUserId?: string; // User ID who cancelled the KOT

  // Additional metadata
  @Prop({ type: String })
  notes?: string; // KOT-specific notes
}

export const KotSchema = SchemaFactory.createForClass(KOT);

// Indexes for better query performance
KotSchema.index({ outletId: 1, kitchenId: 1, kotNumber: 1 });
KotSchema.index({ restaurantId: 1, orderId: 1 });
KotSchema.index({ restaurantId: 1, tableId: 1, status: 1 });
KotSchema.index({ restaurantId: 1, printedAt: -1 });
KotSchema.index({ kitchenId: 1, status: 1, printedAt: -1 });
KotSchema.index({ outletId: 1, kitchenId: 1, createdAt: -1 });
KotSchema.index({ parentKotId: 1 }); // For tracking KOT operations
KotSchema.index({ type: 1, parentKotId: 1 }); // For querying KOT history
