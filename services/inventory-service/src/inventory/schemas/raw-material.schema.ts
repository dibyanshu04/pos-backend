import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RawMaterialDocument = HydratedDocument<RawMaterial>;

@Schema({ timestamps: true })
export class RawMaterial {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  baseUnit: string;

  @Prop({ type: Number, default: 0 })
  averageCost: number; // moving average cost snapshot

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const RawMaterialSchema = SchemaFactory.createForClass(RawMaterial);

