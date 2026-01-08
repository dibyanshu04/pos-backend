import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InventoryLedgerDocument = HydratedDocument<InventoryLedger>;

@Schema({ timestamps: true })
export class InventoryLedger {
  @Prop({ required: true, index: true })
  rawMaterialId: string;

  @Prop({ required: true })
  rawMaterialName: string;

  @Prop({ required: true, index: true })
  restaurantId: string;

  @Prop({ required: true, index: true })
  outletId: string;

  @Prop({
    required: true,
    enum: ['SALE_CONSUMPTION'],
  })
  transactionType: 'SALE_CONSUMPTION';

  @Prop({ required: true })
  quantityChange: number; // negative for consumption

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, enum: ['ORDER'] })
  referenceType: 'ORDER';

  @Prop({ required: true, index: true })
  referenceId: string;

  @Prop()
  remarks?: string;
}

export const InventoryLedgerSchema =
  SchemaFactory.createForClass(InventoryLedger);

InventoryLedgerSchema.index({
  referenceType: 1,
  referenceId: 1,
  transactionType: 1,
});

