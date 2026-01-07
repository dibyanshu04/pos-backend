import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LowStockAlertDocument = LowStockAlert & Document;

@Schema({ timestamps: { createdAt: 'triggeredAt', updatedAt: false } })
export class LowStockAlert {
  @Prop({ type: String, required: true, index: true })
  restaurantId: string;

  @Prop({ type: String, required: true, index: true })
  outletId: string;

  @Prop({ type: Types.ObjectId, ref: 'RawMaterial', required: true, index: true })
  rawMaterialId: Types.ObjectId;

  @Prop({ type: String, required: true })
  rawMaterialName: string;

  @Prop({ type: Number, required: true })
  threshold: number;

  @Prop({ type: Number, required: true })
  stockAtTrigger: number;

  @Prop({ type: Boolean, default: false, index: true })
  isResolved: boolean;

  @Prop({ type: Date })
  resolvedAt?: Date;
}

export const LowStockAlertSchema = SchemaFactory.createForClass(LowStockAlert);

LowStockAlertSchema.index({ outletId: 1, rawMaterialId: 1, isResolved: 1 });

