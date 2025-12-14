import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
export type AreaDocument = HydratedDocument<Area>;

@Schema({ timestamps: true })
export class Area {
  @Prop({ required: true })
  name: string;

  @Prop({
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean; // Soft delete
}

export const AreaSchema = SchemaFactory.createForClass(Area);