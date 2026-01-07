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

  // Billing Configuration (Round-off settings)
  @Prop({
    type: {
      roundOff: {
        enabled: { type: Boolean, default: true },
        method: {
          type: String,
          enum: ['NEAREST', 'UP', 'DOWN'],
          default: 'NEAREST',
        },
        precision: {
          type: Number,
          enum: [0.05, 0.1, 1.0],
          default: 0.05,
        },
      },
    },
    required: false,
  })
  billingConfig?: {
    roundOff: {
      enabled: boolean;
      method: 'NEAREST' | 'UP' | 'DOWN';
      precision: 0.05 | 0.1 | 1.0;
    };
  };
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);
