import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type TableDocument = HydratedDocument<Table>;

@Schema({ timestamps: true })
export class Table {
  @Prop({ required: true })
  name: string; // Example: "T1", "Table-2"

  @Prop({ required: false })
  seatingCapacity: number;

  @Prop({
    enum: ['available', 'occupied', 'reserved', 'closed'],
    default: 'available',
  })
  status: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Outlet',
    required: true,
    index: true,
  })
  outletId: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean; // Soft delete

  @Prop({
    type: Types.ObjectId,
    ref: 'Area',
    required: true,
    index: true,
  })
  areaId: Types.ObjectId;
}

export const TableSchema = SchemaFactory.createForClass(Table);
