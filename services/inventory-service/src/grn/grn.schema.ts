import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { PurchaseUnitEnum } from 'src/common/units/purchase-unit.enum';

export type GrnDocument = Grn & Document;

export class GrnItem {
  @Prop({ type: Types.ObjectId, ref: 'RawMaterial', required: true })
  rawMaterialId: Types.ObjectId;

  @Prop({ type: String, required: true })
  rawMaterialName: string; // snapshot

  @Prop({ type: Number, required: true, min: 0.0001 })
  purchaseQuantity: number; // input purchase unit quantity

  @Prop({ type: String, enum: PurchaseUnitEnum, required: true })
  purchaseUnit: PurchaseUnitEnum;

  @Prop({ type: Number, required: true, min: 0.0001 })
  baseQuantity: number; // converted to base unit

  @Prop({ type: String, enum: BaseUnitEnum, required: true })
  baseUnit: BaseUnitEnum;

  @Prop({ type: Number, required: true, min: 0.0000001 })
  unitCost: number; // cost per BASE UNIT

  @Prop({ type: Number, required: true, min: 0.0001 })
  totalCost: number; // baseQuantity * unitCost
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Grn {
  @Prop({ type: String, required: true, index: true })
  restaurantId: string;

  @Prop({ type: String, required: true, index: true })
  outletId: string;

  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true, index: true })
  vendorId: Types.ObjectId;

  @Prop({ type: String, required: true })
  vendorName: string; // snapshot

  @Prop({ type: String })
  invoiceNumber?: string;

  @Prop({ type: Date })
  invoiceDate?: Date;

  @Prop({ type: [GrnItem], required: true })
  items: GrnItem[];

  @Prop({ type: Number, required: true, min: 0 })
  totalPurchaseCost: number;

  @Prop({ type: String })
  createdByUserId?: string;

  @Prop({ type: Date, default: Date.now, immutable: true })
  createdAt: Date;
}

export const GrnSchema = SchemaFactory.createForClass(Grn);

GrnSchema.index({ outletId: 1, invoiceNumber: 1 }, { unique: false, sparse: true });
GrnSchema.index({ outletId: 1, vendorId: 1, createdAt: -1 });

