import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ItemVariantPricing, ItemVariantPricingSchema } from 'src/variants/schema/variant.schema';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, sparse: true })
  shortCode: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Category',
  })
  categoryId: string;

  @Prop()
  onlineDisplayName?: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['Veg', 'Non-Veg', 'Egg', 'Vegan', 'Jain', 'Gluten-Free'],
  })
  dietaryType?: string;

  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop({
    type: String,
    enum: ['Goods', 'Service'],
  })
  gstType?: string;

  // Tax References (Petpooja style - items select taxes)
  @Prop({ type: [String], default: [] })
  taxIds?: string[]; // Array of Tax IDs selected for this item

  // Variant References (reference to Variant module)
  @Prop({ type: [Types.ObjectId], ref: 'Variant', default: [] })
  variants?: string[];

  // Variant pricing - stores variant IDs with their prices
  @Prop({ type: [ItemVariantPricingSchema], default: [] })
  variantPricing?: ItemVariantPricing[]; 

  // Addon References (reference to Addon module)
  @Prop({ type: [Types.ObjectId], ref: 'Addon', default: [] })
  addonIds?: string[]; // Array of Addon IDs applicable to this item

  @Prop({ type: Types.ObjectId, ref: 'Item' })
  baseItemId?: string;

  @Prop({ required: true })
  outletId: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: [String], default: [] })
  dietaryTags?: string[];

  @Prop()
  imageUrl?: string;

  @Prop({
    type: [String],
    enum: ['Dine-In', 'Takeaway', 'Delivery', 'Expose-Online'],
    default: [],
  })
  orderType?: string[];

  // Legacy inline variations (deprecated - use variantIds instead)
  // Kept for backward compatibility
  @Prop({
    type: [
      {
        name: { type: String },
        price: { type: Number },
        isDefault: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  variations?: Array<{
    name: string;
    price: number;
    isDefault?: boolean;
  }>;

  // Additional metadata
  @Prop({ default: 0 })
  preparationTime?: number; // Preparation time in minutes

  @Prop({ default: 0 })
  displayOrder?: number; // Display order in menu

  @Prop({ default: false })
  isRecommended?: boolean; // Recommended item flag

  @Prop({ default: false })
  isPopular?: boolean; // Popular item flag
}

export const ItemSchema = SchemaFactory.createForClass(Item);

// Indexes
ItemSchema.index({ outletId: 1, isAvailable: 1 });
ItemSchema.index({ categoryId: 1, isAvailable: 1 });