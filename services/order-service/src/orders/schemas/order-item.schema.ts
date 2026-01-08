import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderItemDocument = OrderItem & Document;

@Schema({ timestamps: true })
export class OrderItem {
  // Order Reference (One-to-Many: Order -> OrderItems)
  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  })
  orderId: Types.ObjectId;

  // Menu Item References
  @Prop({ type: String, required: true, index: true })
  menuItemId: string; // Reference to menu-service Item

  @Prop({ type: String, index: true })
  variantId?: string; // Reference to menu-service Variant (optional)

  // Item Information (snapshot at time of order)
  @Prop({ type: String, required: true })
  itemName: string; // Snapshot of item name at order time

  @Prop({ type: String })
  variantName?: string; // Snapshot of variant name (e.g., "Large", "Medium")

  // Category snapshot (for category-wise profit)
  @Prop({ type: String, index: true })
  categoryId?: string;

  @Prop({ type: String })
  categoryName?: string;

  // Pricing
  @Prop({ type: Number, required: true, min: 0 })
  price: number; // Unit price at time of order

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number; // Quantity ordered

  @Prop({ type: Number, required: true, min: 0 })
  totalPrice: number; // price * quantity

  // Recipe Snapshot (immutable - captured at order time)
  @Prop({
    type: [
      {
        rawMaterialId: { type: String, required: true },
        rawMaterialName: { type: String, required: true },
        quantityPerUnit: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],
    default: [],
  })
  recipeSnapshot: {
    rawMaterialId: string;
    rawMaterialName: string;
    quantityPerUnit: number;
    unit: string;
  }[];

  // Complimentary Item (Petpooja style - NOT a discount)
  @Prop({ type: Boolean, default: false, index: true })
  isComplimentary: boolean; // If true, item is free (marketing expense, not revenue reduction)

  @Prop({ type: String })
  complimentaryReason?: string; // Reason for complimentary (mandatory if isComplimentary = true)

  // Tax and taxable amounts (snapshot for complimentary items)
  @Prop({ type: Number, default: 0, min: 0 })
  taxableAmount: number; // Taxable amount (must be 0 for complimentary items)

  @Prop({ type: Number, default: 0, min: 0 })
  taxAmount: number; // Tax amount (must be 0 for complimentary items)

  @Prop({ type: Number, default: 0, min: 0 })
  finalItemTotal: number; // Final item total (must be 0 for complimentary items)

  // COGS Snapshot (immutable once set)
  @Prop({
    type: {
      totalCost: { type: Number, default: 0 },
      breakdown: [
        {
          rawMaterialId: { type: String, required: true },
          rawMaterialName: { type: String, required: true },
          quantityConsumed: { type: Number, required: true },
          unitCost: { type: Number, required: true },
          cost: { type: Number, required: true },
        },
      ],
    },
    default: { totalCost: 0, breakdown: [] },
  })
  cogs: {
    totalCost: number;
    breakdown: {
      rawMaterialId: string;
      rawMaterialName: string;
      quantityConsumed: number;
      unitCost: number;
      cost: number;
    }[];
  };

  // Special Instructions
  @Prop({ type: String })
  specialInstructions?: string; // Customer special instructions for this item

  // Kitchen Assignment (snapshot at time of order)
  @Prop({ type: Types.ObjectId, ref: 'Kitchen', index: true })
  kitchenId?: Types.ObjectId; // Kitchen assigned to this item (snapshot)

  // Course Assignment (snapshot at time of order) - CRITICAL: Never resolve dynamically
  @Prop({ type: Types.ObjectId, index: true })
  courseId?: Types.ObjectId; // Course assigned to this item (snapshot)

  @Prop({ type: String })
  courseName?: string; // Course name snapshot (e.g., "Starter", "Main Course")

  @Prop({ type: Number })
  courseSequence?: number; // Course sequence snapshot (1, 2, 3, etc.)

  // Item Status
  @Prop({
    type: String,
    enum: ['PENDING', 'PRINTED', 'CANCELLED'],
    default: 'PENDING',
    required: true,
    index: true,
  })
  itemStatus: 'PENDING' | 'PRINTED' | 'CANCELLED';

  // KOT Reference (which KOT this item was printed in)
  @Prop({ type: Types.ObjectId, ref: 'KOT', index: true })
  kotId?: Types.ObjectId; // Reference to KOT when item is printed

  // Additional metadata
  @Prop({ type: Date })
  printedAt?: Date; // Timestamp when item was printed in KOT

  @Prop({ type: Date })
  cancelledAt?: Date; // Timestamp when item was cancelled
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// Indexes for better query performance
OrderItemSchema.index({ orderId: 1, itemStatus: 1 });
OrderItemSchema.index({ orderId: 1, kotId: 1 });
OrderItemSchema.index({ menuItemId: 1 });
OrderItemSchema.index({ kotId: 1 });
OrderItemSchema.index({ kitchenId: 1, itemStatus: 1 });
