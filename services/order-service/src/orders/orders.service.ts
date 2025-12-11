// src/orders/orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const createdOrder = new this.orderModel(createOrderDto);
      return await createdOrder.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new NotFoundException('Order with this ID already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findOne({ orderId: id }).exec();
    if (!order) {
      throw new NotFoundException('Order');
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const updateData = Object.fromEntries(
      Object.entries(updateOrderDto).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    const updatedOrder = await this.orderModel
      .findOneAndUpdate({ orderId: id }, updateData, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException('Order');
    }

    return updatedOrder;
  }

  async delete(id: string): Promise<void> {
    const result = await this.orderModel.deleteOne({ orderId: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Order');
    }
  }

  async findByStatus(status: string): Promise<Order[]> {
    return this.orderModel.find({ status }).exec();
  }

  async findByTable(tableNumber: number): Promise<Order[]> {
    return this.orderModel
      .find({
        tableNumber,
        status: { $ne: 'completed' },
      })
      .exec();
  }

  async getOrdersSummary(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    revenue: number;
  }> {
    const totalOrders = await this.orderModel.countDocuments();
    const pendingOrders = await this.orderModel.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing'] },
    });
    const completedOrders = await this.orderModel.countDocuments({
      status: 'completed',
    });

    const revenueResult = await this.orderModel.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      revenue,
    };
  }
}
