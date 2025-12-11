import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type RestaurantSubscriptionDocument = RestaurantSubscription & Document;

@Schema({ timestamps: true })
export class RestaurantSubscription {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Restaurant',
  })
  restaurantId: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'SubscriptionPlan',
  })
  planId: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    required: true,
    enum: ['active', 'canceled', 'expired', 'pending', 'trial'],
    default: 'pending',
  })
  status: string;

  @Prop({ default: true })
  autoRenew: boolean;

  @Prop()
  stripeSubscriptionId: string;

  @Prop()
  razorpaySubscriptionId: string;

  @Prop({
    type: {
      amount: Number,
      currency: String,
      paymentMethod: String,
      transactionId: String,
      paidAt: Date,
    },
  })
  payment: {
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    paidAt: Date;
  };

  @Prop([
    {
      date: Date,
      amount: Number,
      description: String,
      status: String,
    },
  ])
  billingHistory: Array<{
    date: Date;
    amount: number;
    description: string;
    status: string;
  }>;

  @Prop({ default: 0 })
  usedOrdersThisMonth: number;

  @Prop({ default: 0 })
  usedMenuItems: number;

  @Prop({ default: 0 })
  usedOutlets: number;
}

export const RestaurantSubscriptionSchema = SchemaFactory.createForClass(
  RestaurantSubscription,
);
