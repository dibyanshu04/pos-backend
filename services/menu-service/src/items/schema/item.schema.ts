import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, sparse: true })
  shortCode: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Category',
  })
  categoryId: string;

  onlineDisplayName: string;

  @Prop()
  description: string;

  dietaryType: {
    type: String;
    enum: ['Veg', 'Non-Veg', 'Egg', 'Vegan', 'Jain', 'Gluten-Free'];
  };

  @Prop({ required: true })
  basePrice: number;

  gstType: {
    type: String;
    enum: ['Goods', 'Service'];
  };
  @Prop({ required: true, default: 0 })
  taxRate: number;

  @Prop({ type: Types.ObjectId, ref: 'Item' })
  baseItemId: string;

  @Prop({ required: true })
  outletId: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop([String])
  dietaryTags: string[];

  @Prop()
  imageUrl: string;

  orderType: {
    type: [String];
    enum: ['Dine-In', 'Takeaway', 'Delivery', 'Expose-Online'];
  };

  variations: [
    {
      name: string;
      price: number;
      isDefault: boolean;
    },
  ];

  // @Prop({ default: 0 })
  // preparationTime: number;

  // @Prop({ default: 0 })
  // displayOrder: number;

  // @Prop({ type: Object })
  // channelSpecificData: {
  //   zomato?: {
  //     itemId?: string;
  //     price?: number;
  //     isAvailable?: boolean;
  //   };
  //   swiggy?: {
  //     itemId?: string;
  //     price?: number;
  //     isAvailable?: boolean;
  //   };
  // };
}

export const ItemSchema = SchemaFactory.createForClass(Item);
