import { Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  tableNumber?: number;
  customer: {
    name: string;
    phone: string;
    gstin?: string;
  };
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
    gstRate: number;
  }>;
  totalAmount: number;
  gstAmount: number;
  orderType: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}