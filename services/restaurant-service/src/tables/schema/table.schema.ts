import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type TableDocument = HydratedDocument<Table>;

@Schema({ timestamps: true })
export class Table {
  @Prop({ required: true })
  tableNumber: string; // Example: "T1", "Table-2"

  @Prop({ required: false })
  seatingCapacity: number;

  @Prop({
    enum: ['available', 'occupied', 'reserved', 'closed'],
    default: 'available',
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true,
    index: true,
  })
  outletId: string;

  @Prop({ default: false })
  isDeleted: boolean; // Soft delete
}

export const TableSchema = SchemaFactory.createForClass(Table);
