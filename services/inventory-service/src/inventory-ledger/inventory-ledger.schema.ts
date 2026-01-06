import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';

export type InventoryLedgerDocument = InventoryLedger & Document;

export enum InventoryTransactionType {
  PURCHASE = 'PURCHASE',
  SALE_CONSUMPTION = 'SALE_CONSUMPTION',
  WASTAGE = 'WASTAGE',
  ADJUSTMENT = 'ADJUSTMENT',
  OPENING_BALANCE = 'OPENING_BALANCE',
}

export enum InventoryReferenceType {
  ORDER = 'ORDER',
  GRN = 'GRN',
  WASTAGE = 'WASTAGE',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class InventoryLedger {
  @Prop({ type: String, required: true, index: true })
  restaurantId: string;

  @Prop({ type: String, required: true, index: true })
  outletId: string;

  @Prop({ type: Types.ObjectId, ref: 'RawMaterial', required: true, index: true })
  rawMaterialId: Types.ObjectId;

  @Prop({
    type: String,
    enum: InventoryTransactionType,
    required: true,
    index: true,
  })
  transactionType: InventoryTransactionType;

  // Positive => stock in, Negative => stock out
  @Prop({ type: Number, required: true })
  quantityChange: number;

  // ALWAYS base unit
  @Prop({ type: String, enum: BaseUnitEnum, required: true })
  unit: BaseUnitEnum;

  @Prop({ type: String, enum: InventoryReferenceType, required: false })
  referenceType?: InventoryReferenceType;

  @Prop({ type: Types.ObjectId })
  referenceId?: Types.ObjectId;

  @Prop({ type: String })
  remarks?: string;

  @Prop({ type: String, required: true })
  createdByUserId: string;

  @Prop({ type: Date, default: Date.now, immutable: true })
  createdAt: Date;
}

export const InventoryLedgerSchema = SchemaFactory.createForClass(InventoryLedger);

InventoryLedgerSchema.index({ outletId: 1, rawMaterialId: 1, createdAt: 1 });
InventoryLedgerSchema.index({ outletId: 1, rawMaterialId: 1, transactionType: 1 });
InventoryLedgerSchema.index({ rawMaterialId: 1, transactionType: 1 });

