import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AddonDocument = Addon & Document;

// Variant support for Addon Items (variations on addons)
@Schema({ _id: false })
export class AddonItemVariant {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Variant' })
  variantId: string; // Reference to Variant

  @Prop({ required: true, type: String })
  variantValueName: string; // Selected variant value (e.g., "Large")

  @Prop({ default: 0, min: 0 })
  priceModifier?: number; // Price adjustment for this variant
}

export const AddonItemVariantSchema = SchemaFactory.createForClass(AddonItemVariant);

@Schema({ _id: true })
export class AddonItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, default: 0, min: 0 })
  price: number;

  @Prop({ trim: true })
  sapCode?: string;

  @Prop({
    type: String,
    enum: ['Veg', 'Non-Veg', 'Egg'],
    default: 'Veg',
  })
  attribute: string;

  @Prop({
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  available: string;

  // Variant support for addon items (variations on addons)
  @Prop({ type: [Types.ObjectId], ref: 'Variant', default: [] })
  applicableVariantIds?: string[]; // Variants that can be applied to this addon item

  @Prop({ type: [AddonItemVariantSchema], default: [] })
  variantPricing?: AddonItemVariant[]; // Variant-specific pricing for this addon item

  @Prop({ default: 0, index: true })
  rank: number; // Display order within addon
}

export const AddonItemSchema = SchemaFactory.createForClass(AddonItem);

@Schema({ timestamps: true })
export class Addon {
  @Prop({ required: true, trim: true })
  departmentName: string;

  @Prop({ trim: true })
  onlineDisplayName?: string;

  @Prop({ default: 0, min: 0 })
  addonMin: number;

  @Prop({ default: 1, min: 1 })
  addonMax: number;

  @Prop({
    type: String,
    enum: ['Allow Multiple Selection', 'Allow Single Selection'],
    default: 'Allow Multiple Selection',
  })
  addonItemSelection: string;

  @Prop({ default: 1, min: 1 })
  maxSelectionPerAddonAllowed: number;

  @Prop({ default: true })
  showInOnline: boolean;

  @Prop({ default: false })
  allowOpenQuantity: boolean;

  @Prop({ default: 0, index: true })
  rank: number;

  @Prop({
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  @Prop({ required: true, index: true })
  restaurantId: string;

  @Prop({ type: [AddonItemSchema], default: [] })
  items: AddonItem[];

  // Variant support at addon level (if all items in addon support same variants)
  @Prop({ type: [Types.ObjectId], ref: 'Variant', default: [] })
  applicableVariantIds?: string[]; // Variants applicable to all items in this addon
}

export const AddonSchema = SchemaFactory.createForClass(Addon);

AddonSchema.index(
  { restaurantId: 1, 'items.sapCode': 1 },
  { unique: true, sparse: true }
);

AddonSchema.index({ restaurantId: 1, status: 1 });
AddonSchema.index({ applicableVariantIds: 1 });
