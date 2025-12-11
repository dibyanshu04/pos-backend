import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type OutletDocument = Outlet & Document;

@Schema({ timestamps: true })
export class Outlet {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Restaurant',
  })
  restaurantId: string;

  @Prop({
    type: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    required: true,
  })
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop({
    type: {
      openingTime: String, // "09:00"
      closingTime: String, // "23:00"
      timezone: String,
      workingDays: [String], // ["monday", "tuesday", ...]
    },
    required: true,
  })
  timing: {
    openingTime: string;
    closingTime: string;
    timezone: string;
    workingDays: string[];
  };

  @Prop({
    type: {
      tableCount: Number,
      seatingCapacity: Number,
      hasDelivery: Boolean,
      hasTakeaway: Boolean,
      hasDineIn: Boolean,
    },
  })
  facilities: {
    tableCount?: number;
    seatingCapacity?: number;
    hasDelivery: boolean;
    hasTakeaway: boolean;
    hasDineIn: boolean;
  };

  @Prop({
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  })
  status: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  managerName: string;

  @Prop()
  managerContact: string;
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);
