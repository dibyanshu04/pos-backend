  import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
  import { Document, Schema as MongooseSchema, Types } from 'mongoose';

  export type OrderDocument = Order & Document;

  @Schema({ timestamps: true })
  export class Order {
    
    @Prop({ required: true, unique: true })
    orderId: string;

    @Prop()
    tableNumber: number;

    @Prop({
      type: {
        name: String,
        phone: String,
        gstin: String,
      },
    })
    customer: {
      name: string;
      phone: string;
      gstin: string;
    };

    @Prop([
      {
        menuItemId: {
          type: String,
          ref: 'MenuItem',
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        gstRate: { type: Number, required: true },
      },
    ])
    items: Array<{
      menuItemId: string;
      quantity: number;
      price: number;
      gstRate: number;
    }>;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true })
    gstAmount: number;

    @Prop({
      required: true,
      enum: ['dine-in', 'takeaway', 'delivery'],
    })
    orderType: string;

    @Prop({
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    })
    status: string;

    @Prop({
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    })
    paymentStatus: string;
  }

  export const OrderSchema = SchemaFactory.createForClass(Order);
