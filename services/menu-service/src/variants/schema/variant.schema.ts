import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VariantDocument = Variant & Document;

@Schema({ timestamps: true })
export class Variant {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  onlineDisplayName: string;

  @Prop({ type: String, required: true })
  department: string;

  @Prop({ type: String, enum: ['Active', 'Inactive'], default: 'Active' })
  status: string;

  @Prop({ required: true })
  restaurantId: string;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

