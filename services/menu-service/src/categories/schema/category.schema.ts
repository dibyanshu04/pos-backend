import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  onlineDisplayName: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: ['Active', 'Inactive'], default: 'Active' })
  status: string;

  // reference to outlet
  @Prop({ required: true })
  outletId: string;

  @Prop({ type: Boolean, default: false })
  isParentCategory: boolean;

  @Prop({ type: String, default: null })
  parentCategoryId: string | null;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  offlineOrdersImageUrl: string;

  @Prop()
  logoUrl: string;

  @Prop()
  swiggyImageUrl: string;

  // for parent Category.
  // Example for breakfast category, the item will be visible only for the selected days and time.
  @Prop({
    type: [
      {
        name: { type: String },
        days: [{ type: String }],
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
    default: [],
  })
  schedules: {
    name: string;
    days: string[];
    startTime: string;
    endTime: string;
  }[];

  @Prop({ default: 0 })
  rank: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
