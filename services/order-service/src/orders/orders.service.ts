// src/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';
import { KOT, KotDocument } from './schemas/kot.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderWithKotDto } from './dto/create-order-with-kot.dto';
import { AddItemsToOrderDto } from './dto/add-items-to-order.dto';
import {
  GenerateBillDto,
  BillResponseDto,
  BillItemDto,
  BillTaxDto,
} from './dto/generate-bill.dto';
import {
  SettleOrderDto,
  SettleOrderResponseDto,
} from './dto/settle-order.dto';
import {
  CreateOrderWithKotResponseDto,
  KotResponseDto,
} from './dto/kot-response.dto';
import { TableServiceClient } from './services/table-service.client';
import { MenuServiceClient } from './services/menu-service.client';
import { TaxConfigService } from './services/tax-config.service';
import { InventoryServiceClient } from './services/inventory-service.client';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name)
    private orderItemModel: Model<OrderItemDocument>,
    @InjectModel(KOT.name) private kotModel: Model<KotDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectConnection() private connection: Connection,
    private tableServiceClient: TableServiceClient,
    private menuServiceClient: MenuServiceClient,
    private taxConfigService: TaxConfigService,
    private inventoryServiceClient: InventoryServiceClient,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // If tableId is provided, validate table status
      if (createOrderDto.tableId) {
        const tableInfo = await this.tableServiceClient.getTableStatus(
          createOrderDto.tableId,
        );

        if (!tableInfo.exists) {
          throw new NotFoundException(
            `Table with ID ${createOrderDto.tableId} not found`,
          );
        }

        // Check if table is available (for dine-in orders)
        if (createOrderDto.orderType === 'dine-in') {
          if (tableInfo.status !== 'available') {
            throw new BadRequestException(
              `Table ${tableInfo.name || createOrderDto.tableId} is not available. Current status: ${tableInfo.status}`,
            );
          }
        }
      }

      // Convert tableId string to ObjectId if provided
      const orderData: any = { ...createOrderDto };
      if (createOrderDto.tableId) {
        orderData.tableId = new Types.ObjectId(createOrderDto.tableId);
      }

      // Map orderType to enum values
      if (orderData.orderType === 'dine-in') {
        orderData.orderType = 'DINE_IN';
      } else if (orderData.orderType === 'takeaway') {
        orderData.orderType = 'TAKEAWAY';
      }

      // Set default status
      if (!orderData.status) {
        orderData.status = 'DRAFT';
      }

      // Map financial fields to match schema
      orderData.subtotal = orderData.totalAmount - (orderData.gstAmount || 0);
      orderData.tax = orderData.gstAmount || 0;
      orderData.discount = 0;
      orderData.total = orderData.totalAmount;

      const createdOrder = new this.orderModel(orderData);
      const savedOrder = await createdOrder.save();

      // If tableId is provided and order is dine-in, mark table as occupied
      if (
        createOrderDto.tableId &&
        createOrderDto.orderType === 'dine-in'
      ) {
        await this.tableServiceClient.markTableOccupied(
          createOrderDto.tableId,
        );
      }

      return savedOrder;
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

  /**
   * Generate next KOT number for a restaurant
   * Format: KOT-001, KOT-002, etc.
   */
  private async generateKotNumber(
    restaurantId: string,
    session?: ClientSession,
  ): Promise<string> {
    // Find the latest KOT for this restaurant
    const latestKot = await this.kotModel
      .findOne({ restaurantId })
      .sort({ kotNumber: -1 })
      .session(session || null)
      .exec();

    let nextNumber = 1;
    if (latestKot && latestKot.kotNumber) {
      // Extract number from KOT-001 format
      const match = latestKot.kotNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    return `KOT-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Create Order and Generate KOT
   * Uses database transactions to ensure atomicity
   */
  async createOrderWithKOT(
    createOrderDto: CreateOrderWithKotDto,
  ): Promise<CreateOrderWithKotResponseDto> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Validation - Check if table is VACANT
      const isVacant = await this.tableServiceClient.isTableVacant(
        createOrderDto.tableId,
      );
      if (!isVacant) {
        throw new BadRequestException(
          `Table ${createOrderDto.tableId} is not available (not VACANT)`,
        );
      }

      // Step 2: Validation - Validate items and get current prices
      const validatedItems =
        await this.menuServiceClient.validateItemsAndGetPrices(
          createOrderDto.restaurantId,
          createOrderDto.items.map((item) => ({
            menuItemId: item.menuItemId,
            variantId: item.variantId,
          })),
        );

      // Step 3: Calculate financial summaries
      let subtotal = 0;
      const orderItemsData = createOrderDto.items.map((item, index) => {
        const validatedItem = validatedItems[index];
        const totalPrice = validatedItem.price * item.quantity;
        subtotal += totalPrice;

        return {
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          itemName: validatedItem.itemName,
          variantName: validatedItem.variantName,
          price: validatedItem.price,
          quantity: item.quantity,
          totalPrice,
          specialInstructions: item.specialInstructions,
        };
      });

      // For now, assume no tax and discount (can be calculated later)
      const tax = 0;
      const discount = 0;
      const total = subtotal + tax - discount;

      // Step 4: Create Order record with status 'KOT_PRINTED' (since we're generating KOT immediately)
      const tableId = new Types.ObjectId(createOrderDto.tableId);
      const orderData = {
        restaurantId: createOrderDto.restaurantId,
        tableId,
        waiterId: createOrderDto.waiterId,
        customerPhone: createOrderDto.customerPhone,
        status: 'KOT_PRINTED' as const,
        orderType: 'DINE_IN' as const, // Assuming DINE_IN for table orders
        subtotal,
        tax,
        discount,
        total,
        notes: createOrderDto.notes,
        kotPrintedAt: new Date(),
      };

      const order = new this.orderModel(orderData);
      const savedOrder = await order.save({ session });

      // Step 5: Create OrderItems with status 'PRINTED'
      const orderItems = orderItemsData.map((itemData) => ({
        orderId: savedOrder._id,
        menuItemId: itemData.menuItemId,
        variantId: itemData.variantId,
        itemName: itemData.itemName,
        variantName: itemData.variantName,
        price: itemData.price,
        quantity: itemData.quantity,
        totalPrice: itemData.totalPrice,
        specialInstructions: itemData.specialInstructions,
        itemStatus: 'PRINTED' as const,
        printedAt: new Date(),
      }));

      const savedOrderItems = await this.orderItemModel.insertMany(
        orderItems,
        { session },
      );

      // Step 6: Generate KOT number
      const kotNumber = await this.generateKotNumber(
        createOrderDto.restaurantId,
        session,
      );

      // Step 7: Create KOT record
      const kotItems = savedOrderItems.map((orderItem) => ({
        orderItemId: orderItem._id,
        itemName: orderItem.itemName,
        variantName: orderItem.variantName,
        quantity: orderItem.quantity,
        specialInstructions: orderItem.specialInstructions,
      }));

      const kotData = {
        orderId: savedOrder._id,
        restaurantId: createOrderDto.restaurantId,
        tableId,
        kotNumber,
        items: kotItems,
        status: 'PRINTED' as const,
        printedAt: new Date(),
        printedBy: createOrderDto.waiterId,
        notes: createOrderDto.notes,
      };

      const kot = new this.kotModel(kotData);
      const savedKot = await kot.save({ session });

      // Step 8: Update OrderItems with kotId
      await this.orderItemModel.updateMany(
        { _id: { $in: savedOrderItems.map((item) => item._id) } },
        { $set: { kotId: savedKot._id } },
        { session },
      );

      // Step 9: Commit transaction
      await session.commitTransaction();

      // Step 10: (Mock) Trigger event to TableService to mark table as OCCUPIED
      // This is done after transaction commit to avoid blocking
      await this.tableServiceClient.markTableOccupied(createOrderDto.tableId);

      // Step 11: Format response
      const kotResponse: KotResponseDto = {
        kotId: savedKot._id.toString(),
        kotNumber: savedKot.kotNumber,
        orderId: savedOrder._id.toString(),
        restaurantId: savedKot.restaurantId,
        tableId: savedKot.tableId?.toString(),
        items: savedKot.items.map((item) => ({
          orderItemId: item.orderItemId.toString(),
          itemName: item.itemName,
          variantName: item.variantName,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        status: savedKot.status,
        printedAt: savedKot.printedAt,
        printedBy: savedKot.printedBy,
        notes: savedKot.notes,
      };

      return {
        orderId: savedOrder._id.toString(),
        kot: kotResponse,
      };
    } catch (error) {
      // Rollback transaction on any error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Add Items to Existing Order and Generate Delta KOT
   * Creates a new KOT containing only the newly added items
   * Uses database transactions to ensure atomicity
   */
  async addItemsToOrder(
    addItemsDto: AddItemsToOrderDto,
  ): Promise<{ orderId: string; kot: KotResponseDto }> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Fetch existing Order
      const orderId = new Types.ObjectId(addItemsDto.orderId);
      const existingOrder = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();

      if (!existingOrder) {
        throw new NotFoundException(
          `Order with ID ${addItemsDto.orderId} not found`,
        );
      }

      // Step 2: Validate that order is not in a final state
      if (
        existingOrder.status === 'COMPLETED' ||
        existingOrder.status === 'CANCELLED'
      ) {
        throw new BadRequestException(
          `Cannot add items to order with status ${existingOrder.status}`,
        );
      }

      // Step 3: Validation - Validate new items and get current prices
      const validatedItems =
        await this.menuServiceClient.validateItemsAndGetPrices(
          existingOrder.restaurantId,
          addItemsDto.items.map((item) => ({
            menuItemId: item.menuItemId,
            variantId: item.variantId,
          })),
        );

      // Step 4: Calculate financial summaries for new items
      let newSubtotal = 0;
      const newOrderItemsData = addItemsDto.items.map((item, index) => {
        const validatedItem = validatedItems[index];
        const totalPrice = validatedItem.price * item.quantity;
        newSubtotal += totalPrice;

        return {
          orderId: existingOrder._id,
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          itemName: validatedItem.itemName,
          variantName: validatedItem.variantName,
          price: validatedItem.price,
          quantity: item.quantity,
          totalPrice,
          specialInstructions: item.specialInstructions,
          itemStatus: 'PENDING' as const, // New items start as PENDING
        };
      });

      // Step 5: Create new OrderItems with status PENDING
      const savedNewOrderItems = await this.orderItemModel.insertMany(
        newOrderItemsData,
        { session },
      );

      // Step 6: Update Order financial summaries
      const updatedSubtotal = existingOrder.subtotal + newSubtotal;
      // For now, assume tax and discount remain proportional (can be recalculated)
      const taxRate = existingOrder.subtotal > 0 
        ? existingOrder.tax / existingOrder.subtotal 
        : 0;
      const discountRate = existingOrder.subtotal > 0
        ? existingOrder.discount / existingOrder.subtotal
        : 0;
      
      const updatedTax = updatedSubtotal * taxRate;
      const updatedDiscount = updatedSubtotal * discountRate;
      const updatedTotal = updatedSubtotal + updatedTax - updatedDiscount;

      await this.orderModel.findByIdAndUpdate(
        existingOrder._id,
        {
          $set: {
            subtotal: updatedSubtotal,
            tax: updatedTax,
            discount: updatedDiscount,
            total: updatedTotal,
          },
        },
        { session, new: true },
      );

      // Step 7: Generate new KOT number (delta KOT)
      const kotNumber = await this.generateKotNumber(
        existingOrder.restaurantId,
        session,
      );

      // Step 8: Create Delta KOT containing only the newly added items
      const kotItems = savedNewOrderItems.map((orderItem) => ({
        orderItemId: orderItem._id,
        itemName: orderItem.itemName,
        variantName: orderItem.variantName,
        quantity: orderItem.quantity,
        specialInstructions: orderItem.specialInstructions,
      }));

      const kotData = {
        orderId: existingOrder._id,
        restaurantId: existingOrder.restaurantId,
        tableId: existingOrder.tableId,
        kotNumber,
        items: kotItems, // Only new items in this KOT
        status: 'PRINTED' as const,
        printedAt: new Date(),
        printedBy: existingOrder.waiterId,
      };

      const kot = new this.kotModel(kotData);
      const savedKot = await kot.save({ session });

      // Step 9: Update new OrderItems to PRINTED status and link to KOT
      await this.orderItemModel.updateMany(
        { _id: { $in: savedNewOrderItems.map((item) => item._id) } },
        {
          $set: {
            itemStatus: 'PRINTED',
            kotId: savedKot._id,
            printedAt: new Date(),
          },
        },
        { session },
      );

      // Step 10: Update Order status if needed (if it was DRAFT, keep it; if KOT_PRINTED, keep it)
      // Order status remains as is since we're just adding items

      // Step 11: Commit transaction
      await session.commitTransaction();

      // Step 12: Format response
      const kotResponse: KotResponseDto = {
        kotId: savedKot._id.toString(),
        kotNumber: savedKot.kotNumber,
        orderId: existingOrder._id.toString(),
        restaurantId: savedKot.restaurantId,
        tableId: savedKot.tableId?.toString(),
        items: savedKot.items.map((item) => ({
          orderItemId: item.orderItemId.toString(),
          itemName: item.itemName,
          variantName: item.variantName,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        status: savedKot.status,
        printedAt: savedKot.printedAt,
        printedBy: savedKot.printedBy,
        notes: savedKot.notes,
      };

      return {
        orderId: existingOrder._id.toString(),
        kot: kotResponse,
      };
    } catch (error) {
      // Rollback transaction on any error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Generate next Bill number for a restaurant
   * Format: BILL-001, BILL-002, etc.
   */
  private async generateBillNumber(
    restaurantId: string,
    session?: ClientSession,
  ): Promise<string> {
    // Find the latest Order with a billNumber for this restaurant
    const latestOrder = await this.orderModel
      .findOne({ restaurantId, billNumber: { $exists: true, $ne: null } })
      .sort({ billNumber: -1 })
      .session(session || null)
      .exec();

    let nextNumber = 1;
    if (latestOrder && latestOrder.billNumber) {
      // Extract number from BILL-001 format
      const match = latestOrder.billNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    return `BILL-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Generate Bill for an Order
   * Checks for unprinted items, calculates totals, generates bill number
   */
  async generateBill(
    generateBillDto: GenerateBillDto,
  ): Promise<BillResponseDto> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Fetch existing Order
      const orderId = new Types.ObjectId(generateBillDto.orderId);
      const existingOrder = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();

      if (!existingOrder) {
        throw new NotFoundException(
          `Order with ID ${generateBillDto.orderId} not found`,
        );
      }

      // Step 2: Check if order is already billed
      if (existingOrder.status === 'BILLED' || existingOrder.status === 'COMPLETED') {
        throw new BadRequestException(
          `Order with ID ${generateBillDto.orderId} is already billed`,
        );
      }

      // Step 3: Check for unprinted items (items with status PENDING)
      const unprintedItems = await this.orderItemModel
        .find({
          orderId: existingOrder._id,
          itemStatus: 'PENDING',
        })
        .session(session)
        .exec();

      const hasUnprintedItems = unprintedItems.length > 0;
      let unprintedItemsWarning: string | undefined;

      if (hasUnprintedItems) {
        unprintedItemsWarning = `Warning: ${unprintedItems.length} item(s) have not been printed yet. Consider printing KOT before billing.`;
        // Note: We still proceed with billing, but warn the user
      }

      // Step 4: Fetch all order items
      const allOrderItems = await this.orderItemModel
        .find({ orderId: existingOrder._id })
        .session(session)
        .exec();

      // Step 5: Calculate subtotal from all items
      const subtotal = allOrderItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );

      // Step 6: Get tax configuration and calculate taxes
      const taxConfig = await this.taxConfigService.getTaxConfig(
        existingOrder.restaurantId,
      );
      const taxBreakdowns = this.taxConfigService.calculateTaxes(
        subtotal,
        taxConfig,
      );
      const totalTax = taxBreakdowns.reduce(
        (sum, tax) => sum + tax.amount,
        0,
      );

      // Step 7: Apply discount (use provided discount or existing discount)
      const discount =
        generateBillDto.discount !== undefined
          ? generateBillDto.discount
          : existingOrder.discount;
      const discountReason = generateBillDto.discountReason;

      // Step 8: Calculate grand total
      const grandTotal = subtotal + totalTax - discount;

      // Step 9: Generate bill number
      const billNumber = await this.generateBillNumber(
        existingOrder.restaurantId,
        session,
      );

      // Step 10: Update Order status to BILLED (only if no unprinted items)
      if (!hasUnprintedItems) {
        await this.orderModel.findByIdAndUpdate(
          existingOrder._id,
          {
            $set: {
              status: 'BILLED',
              billNumber,
              subtotal,
              tax: totalTax,
              discount,
              total: grandTotal,
              billedAt: new Date(),
            },
          },
          { session, new: true },
        );
      } else {
        // If there are unprinted items, still update financials but keep status as is
        await this.orderModel.findByIdAndUpdate(
          existingOrder._id,
          {
            $set: {
              billNumber,
              subtotal,
              tax: totalTax,
              discount,
              total: grandTotal,
              billedAt: new Date(),
            },
          },
          { session, new: true },
        );
      }

      // Step 11: Commit transaction
      await session.commitTransaction();

      // Step 12: (Mock) Trigger event to TableService to mark table as BILLED
      // This is done after transaction commit to avoid blocking
      if (existingOrder.tableId && !hasUnprintedItems) {
        await this.tableServiceClient.markTableBilled(
          existingOrder.tableId.toString(),
        );
      }

      // Step 13: Format bill response
      const billItems: BillItemDto[] = allOrderItems.map((item) => ({
        orderItemId: item._id.toString(),
        menuItemId: item.menuItemId,
        itemName: item.itemName,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        specialInstructions: item.specialInstructions,
      }));

      const billTaxes: BillTaxDto[] = taxBreakdowns.map((tax) => ({
        name: tax.name,
        rate: tax.rate,
        amount: tax.amount,
        type: tax.type as 'CGST' | 'SGST' | 'IGST' | 'OTHER',
      }));

      const billResponse: BillResponseDto = {
        billId: existingOrder._id.toString(),
        billNumber,
        orderId: existingOrder._id.toString(),
        restaurantId: existingOrder.restaurantId,
        tableId: existingOrder.tableId?.toString(),
        waiterId: existingOrder.waiterId,
        customerPhone: existingOrder.customerPhone,
        items: billItems,
        subtotal,
        taxes: billTaxes,
        totalTax,
        discount,
        discountReason,
        grandTotal,
        orderType: existingOrder.orderType,
        status: hasUnprintedItems ? existingOrder.status : 'BILLED',
        billedAt: new Date(),
        hasUnprintedItems,
        unprintedItemsWarning,
      };

      return billResponse;
    } catch (error) {
      // Rollback transaction on any error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Settle Order - Record payment and complete the order
   * Validates payment amount, records payment, updates order status, and triggers events
   */
  async settleOrder(
    settleOrderDto: SettleOrderDto,
  ): Promise<SettleOrderResponseDto> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Fetch existing Order
      const orderId = new Types.ObjectId(settleOrderDto.orderId);
      const existingOrder = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();

      if (!existingOrder) {
        throw new NotFoundException(
          `Order with ID ${settleOrderDto.orderId} not found`,
        );
      }

      // Step 2: Check if order is already completed
      if (existingOrder.status === 'COMPLETED') {
        throw new BadRequestException(
          `Order with ID ${settleOrderDto.orderId} is already completed`,
        );
      }

      // Step 3: Check if order is billed (should be billed before settlement)
      if (existingOrder.status !== 'BILLED') {
        throw new BadRequestException(
          `Order must be billed before settlement. Current status: ${existingOrder.status}`,
        );
      }

      // Step 4: Validation - Ensure paidAmount matches the billTotal
      const billTotal = existingOrder.total;
      const paidAmount = settleOrderDto.amount;

      if (Math.abs(paidAmount - billTotal) > 0.01) {
        // Allow small floating point differences (0.01)
        throw new BadRequestException(
          `Payment amount (${paidAmount}) does not match bill total (${billTotal})`,
        );
      }

      // Step 5: Create Payment record
      const paymentData = {
        orderId: existingOrder._id,
        restaurantId: existingOrder.restaurantId,
        paymentMethod: settleOrderDto.paymentMethod,
        amount: paidAmount,
        status: 'COMPLETED' as const,
        transactionId: settleOrderDto.transactionId,
        referenceNumber: settleOrderDto.referenceNumber,
        gatewayName: settleOrderDto.gatewayName,
        gatewayTransactionId: settleOrderDto.gatewayTransactionId,
        cardLastFour: settleOrderDto.cardLastFour,
        cardType: settleOrderDto.cardType,
        upiId: settleOrderDto.upiId,
        notes: settleOrderDto.notes,
        completedAt: new Date(),
      };

      const payment = new this.paymentModel(paymentData);
      const savedPayment = await payment.save({ session });

      // Step 6: Update Order Status to COMPLETED
      await this.orderModel.findByIdAndUpdate(
        existingOrder._id,
        {
          $set: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        },
        { session, new: true },
      );

      // Step 7: Commit transaction
      await session.commitTransaction();

      // Step 8: (Mock) Trigger event to TableService to mark table as VACANT
      // This is done after transaction commit to avoid blocking
      if (existingOrder.tableId) {
        await this.tableServiceClient.markTableVacant(
          existingOrder.tableId.toString(),
        );
      }

      // Step 9: (Mock) Trigger event to InventoryService to deduct stock
      // Fetch all order items for inventory deduction
      const orderItems = await this.orderItemModel
        .find({ orderId: existingOrder._id })
        .exec();

      const inventoryItems = orderItems.map((item) => ({
        menuItemId: item.menuItemId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      await this.inventoryServiceClient.deductStock(
        existingOrder.restaurantId,
        inventoryItems,
      );

      // Step 10: Format response
      const response: SettleOrderResponseDto = {
        orderId: existingOrder._id.toString(),
        paymentId: savedPayment._id.toString(),
        billNumber: existingOrder.billNumber,
        paymentMethod: savedPayment.paymentMethod,
        amount: savedPayment.amount,
        status: savedPayment.status,
        orderStatus: 'COMPLETED',
        settledAt: new Date(),
      };

      return response;
    } catch (error) {
      // Rollback transaction on any error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
