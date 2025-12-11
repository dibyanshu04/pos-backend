import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    enum: ['base', 'zomato', 'swiggy', 'custom'],
    default: 'custom',
  })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Menu' })
  baseMenuId: string;

  @Prop({ required: true })
  outletId: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop([{ type: Types.ObjectId, ref: 'Category' }])
  categoryIds: string[]; // Reference to categories

  @Prop([{ type: Types.ObjectId, ref: 'Item' }])
  itemIds: string[]; // Reference to items

  @Prop({ default: 0 })
  version: number;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
