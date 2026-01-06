import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VendorDocument = Vendor & Document;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ type: String, required: true, index: true })
  restaurantId: string;

  @Prop({ type: String, required: true, index: true })
  outletId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String })
  gstin?: string;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

VendorSchema.index({ outletId: 1, name: 1 }, { unique: true });

