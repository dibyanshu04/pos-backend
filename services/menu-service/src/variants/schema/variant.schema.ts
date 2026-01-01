import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VariantDocument = Variant & Document;

// Variant Value (e.g., Small, Medium, Large)
@Schema({ _id: true })
export class VariantValue {
  @Prop({ required: true, trim: true })
  name: string; // e.g., "Small", "Medium", "Large"

  @Prop({ trim: true })
  displayName?: string; // Optional display name

  @Prop({ default: 0, min: 0 })
  price: number; // Price difference for this variant value

  @Prop({ default: 0, min: 0 })
  basePrice?: number; // Base price if this is default variant

  @Prop({ default: false })
  isDefault: boolean; // Default variant value

  @Prop({
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  @Prop({ default: 0, index: true })
  rank: number; // Display order
}

export const VariantValueSchema = SchemaFactory.createForClass(VariantValue);

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

  @Prop({ type: [VariantValueSchema], default: [] })
  values: VariantValue[]; // Variant values (Small, Medium, Large, etc.)

  @Prop({ default: false })
  isRequired: boolean; // Is variant selection required

  @Prop({ default: 1, min: 1 })
  minSelection: number; // Minimum selections allowed

  @Prop({ default: 1, min: 1 })
  maxSelection: number; // Maximum selections allowed

  @Prop({ default: 0, index: true })
  rank: number; // Display order
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

// Indexes
VariantSchema.index({ restaurantId: 1, status: 1 });
VariantSchema.index({ restaurantId: 1, department: 1 });
