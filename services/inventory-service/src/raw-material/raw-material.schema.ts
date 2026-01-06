import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RawMaterialCategory } from './enums/raw-material-category.enum';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { PurchaseUnitEnum } from 'src/common/units/purchase-unit.enum';

export type RawMaterialDocument = RawMaterial & Document;

export interface CostingSnapshot {
  averageCost: number;
  lastPurchaseCost: number;
}

@Schema({ timestamps: true })
export class RawMaterial {
  @Prop({ type: String, required: true, index: true })
  restaurantId: string;

  @Prop({ type: String, required: true, index: true })
  outletId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, enum: RawMaterialCategory, required: true })
  category: RawMaterialCategory;

  @Prop({ type: String, enum: BaseUnitEnum, required: true })
  baseUnit: BaseUnitEnum;

  @Prop({ type: String, enum: PurchaseUnitEnum, required: true })
  purchaseUnit: PurchaseUnitEnum;

  @Prop({ type: Number, required: true, min: 0.0001 })
  conversionFactor: number;

  @Prop({ type: Boolean, default: false })
  isPerishable: boolean;

  @Prop({ type: Number })
  shelfLifeInDays?: number;

  @Prop({
    type: {
      averageCost: { type: Number, default: 0 },
      lastPurchaseCost: { type: Number, default: 0 },
    },
    default: { averageCost: 0, lastPurchaseCost: 0 },
  })
  costing: CostingSnapshot;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: String })
  createdByUserId?: string;

  @Prop({ type: String })
  updatedByUserId?: string;

  // Low stock threshold (BASE UNIT). Optional; used for alerts only.
  @Prop({ type: Number, min: 0 })
  lowStockThreshold?: number;
}

export const RawMaterialSchema = SchemaFactory.createForClass(RawMaterial);

RawMaterialSchema.index({ outletId: 1, code: 1 }, { unique: true });
RawMaterialSchema.index({ outletId: 1, name: 1 }, { unique: true });
RawMaterialSchema.index({ restaurantId: 1, outletId: 1, category: 1 });
RawMaterialSchema.index({ outletId: 1, isActive: 1 });

