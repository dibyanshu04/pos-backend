import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class ItemVariantPricing {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Variant' })
  variant: string; // Reference to Variant ID

  @Prop({ required: true, min: 0 })
  price: number; // Price for this variant on this item
}

export const ItemVariantPricingSchema =
  SchemaFactory.createForClass(ItemVariantPricing);
export type VariantDocument = Variant & Document;

@Schema({ timestamps: true })
export class Variant {
  @Prop({ required: true, trim: true })
  name: string; // e.g., "Size", "Toppings", "Crust Type"

  @Prop({ type: String })
  onlineDisplayName?: string;

  @Prop({ type: String, required: true })
  department: string; // Variant department/category

  @Prop({
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  @Prop({ required: true, index: true })
  restaurantId: string;

  @Prop({ default: 0, index: true })
  rank: number; // Display order
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

// Indexes
VariantSchema.index({ restaurantId: 1, status: 1 });
VariantSchema.index({ restaurantId: 1, department: 1 });
