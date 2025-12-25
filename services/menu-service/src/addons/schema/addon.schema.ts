import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AddonDocument = Addon & Document;

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
}

export const AddonSchema = SchemaFactory.createForClass(Addon);

AddonSchema.index(
  { restaurantId: 1, 'items.sapCode': 1 },
  { unique: true, sparse: true }
);
