import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  // Order Reference (One-to-Many: Order -> Payments)
  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  })
  orderId: Types.ObjectId;

  // Restaurant Reference
  @Prop({ type: String, required: true, index: true })
  restaurantId: string; // Reference to restaurant-service

  // Payment Method
  @Prop({
    type: String,
    enum: [
      'CASH',
      'CARD',
      'UPI',
      'WALLET',
      'NET_BANKING',
      'CHEQUE',
      'CREDIT',
      'OTHER',
    ],
    required: true,
    index: true,
  })
  paymentMethod:
    | 'CASH'
    | 'CARD'
    | 'UPI'
    | 'WALLET'
    | 'NET_BANKING'
    | 'CHEQUE'
    | 'CREDIT'
    | 'OTHER';

  // Payment Amount
  @Prop({ type: Number, required: true, min: 0 })
  amount: number; // Payment amount for this split

  // Payment Status
  @Prop({
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
    required: true,
    index: true,
  })
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

  // Transaction Information
  @Prop({ type: String })
  transactionId?: string; // External transaction ID (e.g., from payment gateway)

  @Prop({ type: String })
  referenceNumber?: string; // Reference number (e.g., cheque number, UPI reference)

  // Payment Gateway Information (if applicable)
  @Prop({ type: String })
  gatewayName?: string; // Payment gateway name (e.g., "Razorpay", "Stripe")

  @Prop({ type: String })
  gatewayTransactionId?: string; // Gateway-specific transaction ID

  // Card Information (if payment method is CARD)
  @Prop({ type: String })
  cardLastFour?: string; // Last 4 digits of card

  @Prop({ type: String })
  cardType?: string; // Card type (e.g., "Visa", "Mastercard")

  // UPI Information (if payment method is UPI)
  @Prop({ type: String })
  upiId?: string; // UPI ID used for payment

  // Additional metadata
  @Prop({ type: String })
  notes?: string; // Payment notes

  @Prop({ type: Date })
  completedAt?: Date; // Timestamp when payment was completed

  @Prop({ type: Date })
  failedAt?: Date; // Timestamp when payment failed

  @Prop({ type: String })
  failureReason?: string; // Reason for payment failure

  @Prop({ type: Date })
  refundedAt?: Date; // Timestamp when payment was refunded

  @Prop({ type: String })
  refundReason?: string; // Reason for refund

  @Prop({ type: String })
  processedBy?: string; // User ID who processed the payment
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes for better query performance
PaymentSchema.index({ restaurantId: 1, orderId: 1 });
PaymentSchema.index({ restaurantId: 1, status: 1 });
PaymentSchema.index({ restaurantId: 1, paymentMethod: 1 });
PaymentSchema.index({ restaurantId: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ gatewayTransactionId: 1 });
