import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number; // Monthly price

  @Prop({ required: true, default: 'INR' })
  currency: string;

  @Prop({ required: true })
  billingCycle: string; // 'monthly', 'quarterly', 'yearly'

  @Prop({
    type: {
      maxOutlets: Number,
      maxUsers: Number,
      maxMenuItems: Number,
      maxOrdersPerMonth: Number,
      hasOnlineOrdering: Boolean,
      hasGSTBilling: Boolean,
      hasInventoryManagement: Boolean,
      hasReporting: Boolean,
      hasMultiChannel: Boolean,
      supportType: String, // 'basic', 'priority', 'dedicated'
    },
    required: true,
  })
  features: {
    maxOutlets: number;
    maxUsers: number;
    maxMenuItems: number;
    maxOrdersPerMonth: number;
    hasOnlineOrdering: boolean;
    hasGSTBilling: boolean;
    hasInventoryManagement: boolean;
    hasReporting: boolean;
    hasMultiChannel: boolean;
    supportType: string;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  trialPeriod: number; // Days

  @Prop({ default: 0 })
  setupFee: number;

  @Prop()
  stripePriceId: string; // For Stripe integration

  @Prop()
  razorpayPlanId: string; // For Razorpay integration
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);
