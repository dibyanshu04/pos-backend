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
import { CreateDraftDto } from './dto/create-draft.dto';
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
import {
  PosSessionService,
  PosSessionDocument,
} from '../pos-session/pos-session.service';
import { KitchenService } from '../kitchen/kitchen.service';

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
    private posSessionService: PosSessionService,
    private kitchenService: KitchenService,
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

  /**
   * Create or Update Draft Order
   * Saves a draft order without printing KOT or generating bill
   * If orderId is provided, updates existing draft (only if status is DRAFT)
   * If orderId is not provided, creates a new draft order
   */
  async createOrUpdateDraft(createDraftDto: CreateDraftDto): Promise<Order> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 0: Check for active POS session (required for order creation)
      const activeSession = await this.posSessionService.findActiveSession(
        createDraftDto.outletId,
      );
      if (!activeSession) {
        throw new BadRequestException(
          'No active POS session found for this outlet. Please open a POS session before creating orders.',
        );
      }

      // Step 0.1: Check if POS session has Z-Report (locked)
      if (activeSession.zReportId) {
        throw new BadRequestException(
          'Cannot create or modify orders. Z-Report has been generated for this session. All orders are locked.',
        );
      }

      // Step 1: Validate items and get current prices from menu-service
      const validatedItems =
        await this.menuServiceClient.validateItemsAndGetPrices(
          createDraftDto.restaurantId,
          createDraftDto.items.map((item) => ({
            menuItemId: item.menuItemId,
            variantId: item.variantId,
          })),
        );

      // Step 2: Collect all unique taxIds from items
      const allTaxIds = new Set<string>();
      validatedItems.forEach((item) => {
        if (item.taxIds && item.taxIds.length > 0) {
          item.taxIds.forEach((taxId) => allTaxIds.add(taxId));
        }
      });

      // Step 3: Fetch tax details for all taxIds
      const taxDetails =
        allTaxIds.size > 0
          ? await this.menuServiceClient.getTaxDetails(
              createDraftDto.restaurantId,
              Array.from(allTaxIds),
            )
          : [];

      // Create a map for quick tax lookup
      const taxMap = new Map<string, typeof taxDetails[0]>();
      taxDetails.forEach((tax) => {
        taxMap.set(tax._id, tax);
      });

      // Step 4: Calculate financial summaries and tax per item
      let subtotal = 0;
      let totalTax = 0;

      const orderItemsData = createDraftDto.items.map((item, index) => {
        const validatedItem = validatedItems[index];
        // Use price from DTO (frontend may have calculated it) or validated price
        const unitPrice = item.price || validatedItem.price;
        const itemPriceWithQuantity = unitPrice * item.quantity;

        // Calculate tax for this item based on its taxIds
        let itemTax = 0;
        let itemSubtotal = itemPriceWithQuantity;

        if (validatedItem.taxIds && validatedItem.taxIds.length > 0) {
          // Get tax details for this item's taxes, sorted by priority
          const itemTaxes = validatedItem.taxIds
            .map((taxId) => taxMap.get(taxId))
            .filter((tax) => tax && tax.isActive) // Only active taxes
            .sort((a, b) => (a?.priority || 0) - (b?.priority || 0)); // Sort by priority

          // Calculate tax for each tax on this item
          let taxableAmount = itemPriceWithQuantity;
          itemTaxes.forEach((tax) => {
            if (!tax) return;

            let taxAmount = 0;
            if (tax.taxType === 'PERCENTAGE') {
              if (tax.inclusionType === 'INCLUSIVE') {
                // Backward calculation: if tax is inclusive, extract tax from price
                // Formula: tax = (price * rate) / (100 + rate)
                taxAmount =
                  (taxableAmount * tax.value) / (100 + tax.value);
                taxableAmount -= taxAmount; // Adjust taxable amount for next tax (base price reduces)
                itemSubtotal -= taxAmount; // Reduce subtotal by extracted tax
              } else {
                // EXCLUSIVE: tax is added on top
                taxAmount = (taxableAmount * tax.value) / 100;
                // Subtotal remains the same for exclusive taxes
              }
            } else {
              // FIXED amount tax
              taxAmount = tax.value * item.quantity; // Fixed amount per item
              // For fixed taxes, if inclusive, reduce subtotal
              if (tax.inclusionType === 'INCLUSIVE') {
                itemSubtotal -= taxAmount;
              }
            }

            itemTax += taxAmount;
          });
        }

        subtotal += itemSubtotal;
        totalTax += itemTax;

        return {
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          itemName: validatedItem.itemName,
          variantName: validatedItem.variantName,
          price: unitPrice,
          quantity: item.quantity,
          totalPrice: itemSubtotal, // This is the base price (after extracting inclusive taxes)
          specialInstructions: item.specialInstructions,
        };
      });

      // Step 5: Calculate total
      const discount = 0; // No discount for drafts
      const tax = totalTax;
      const total = subtotal + tax - discount;

      // Step 6: Convert tableId to ObjectId
      const tableId = new Types.ObjectId(createDraftDto.tableId);

      // Step 7: Determine order type
      const orderType = createDraftDto.orderType || 'DINE_IN';

      // Step 8: Handle create or update logic
      let savedOrder: OrderDocument;

      if (createDraftDto.orderId) {
        // UPDATE EXISTING DRAFT
        const orderId = new Types.ObjectId(createDraftDto.orderId);
        const existingOrder = await this.orderModel
          .findById(orderId)
          .session(session)
          .exec();

        if (!existingOrder) {
          throw new NotFoundException(
            `Order with ID ${createDraftDto.orderId} not found`,
          );
        }

        // Security Check: Ensure order is in DRAFT status
        if (existingOrder.status !== 'DRAFT') {
          throw new BadRequestException(
            `Cannot modify order with status ${existingOrder.status}. Only DRAFT orders can be modified via this endpoint.`,
          );
        }

        // Update order fields
        existingOrder.tableId = tableId;
        existingOrder.waiterId = createDraftDto.waiterId;
        existingOrder.customerId = createDraftDto.customerId;
        existingOrder.customerPhone = createDraftDto.customerPhone;
        existingOrder.subtotal = subtotal;
        existingOrder.tax = tax;
        existingOrder.discount = discount;
        existingOrder.total = total;
        existingOrder.notes = createDraftDto.notes;
        existingOrder.orderType = orderType;

        savedOrder = await existingOrder.save({ session });

        // Delete existing order items and create new ones
        await this.orderItemModel.deleteMany(
          { orderId: savedOrder._id },
          { session },
        );
      } else {
        // CREATE NEW DRAFT
        const orderData = {
          restaurantId: createDraftDto.restaurantId,
          tableId,
          waiterId: createDraftDto.waiterId,
          customerId: createDraftDto.customerId,
          customerPhone: createDraftDto.customerPhone,
          posSessionId: activeSession._id, // Attach POS session
          status: 'DRAFT' as const,
          orderType,
          subtotal,
          tax,
          discount,
          total,
          notes: createDraftDto.notes,
        };

        const newOrder = new this.orderModel(orderData);
        savedOrder = await newOrder.save({ session });
      }

      // Step 9: Create OrderItems
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
        itemStatus: 'PENDING' as const, // Draft items are always PENDING
      }));

      await this.orderItemModel.insertMany(orderItems, { session });

      // Step 9: Commit transaction
      await session.commitTransaction(); 

      // Step 11: Populate order items for response
      const populatedOrder : any = await this.orderModel
        .findById(savedOrder._id)
        .exec();

      return populatedOrder;
    } catch (error) {
      // Rollback transaction on any error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
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
   * Generate next KOT number for a kitchen (per day, per kitchen)
   * Format: KOT-001, KOT-002, etc.
   * KOT numbers reset daily per kitchen
   */
  private async generateKotNumber(
    outletId: string,
    kitchenId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<string> {
    // Get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find the latest KOT for this kitchen today
    const latestKot = await this.kotModel
      .findOne({
        outletId,
        kitchenId,
        createdAt: { $gte: today, $lt: tomorrow },
      })
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
      // Step 0: Check for active POS session (required for order creation)
      const activeSession = await this.posSessionService.findActiveSession(
        createOrderDto.outletId,
      );
      if (!activeSession) {
        throw new BadRequestException(
          'No active POS session found for this outlet. Please open a POS session before creating orders.',
        );
      }

      // Step 0.1: Check if POS session has Z-Report (locked)
      if (activeSession.zReportId) {
        throw new BadRequestException(
          'Cannot create orders. Z-Report has been generated for this session. All orders are locked.',
        );
      }

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

      // Step 2.1: Get default kitchen for outlet
      const defaultKitchen = await this.kitchenService.getDefaultKitchenOrFail(
        createOrderDto.outletId,
      );

      // Step 2.2: Resolve kitchen for each item
      // If menu item has kitchenId, use it; otherwise use default kitchen
      const orderItemsData = await Promise.all(
        createOrderDto.items.map(async (item, index) => {
          const validatedItem = validatedItems[index];
          const totalPrice = validatedItem.price * item.quantity;

          // Resolve kitchen: use item's kitchenId if available, else default
          let kitchenId: Types.ObjectId;
          let kitchenName: string;

          if (validatedItem.kitchenId) {
            // Validate kitchen exists and is active
            const kitchen = await this.kitchenService.validateKitchen(
              validatedItem.kitchenId,
              createOrderDto.outletId,
            );
            kitchenId = kitchen._id;
            kitchenName = kitchen.name;
          } else {
            // Use default kitchen
            kitchenId = defaultKitchen._id;
            kitchenName = defaultKitchen.name;
          }

          return {
            menuItemId: item.menuItemId,
            variantId: item.variantId,
            itemName: validatedItem.itemName,
            variantName: validatedItem.variantName,
            price: validatedItem.price,
            quantity: item.quantity,
            totalPrice,
            specialInstructions: item.specialInstructions,
            kitchenId,
            kitchenName,
          };
        }),
      );

      // Step 3: Calculate financial summaries
      let subtotal = 0;
      orderItemsData.forEach((itemData) => {
        subtotal += itemData.totalPrice;
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
        posSessionId: activeSession._id, // Attach POS session
        status: 'KOT_PRINTED' as const,
        orderType: 'DINE_IN' as const, // Assuming DINE_IN for table orders
        subtotal,
        tax,
        discount,
        total,
        notes: createOrderDto.notes,
        kotPrintedAt: new Date(),
        kotIds: [], // Will be populated after KOTs are created
      };

      const order = new this.orderModel(orderData);
      const savedOrder = await order.save({ session });

      // Step 5: Create OrderItems with status 'PRINTED' and kitchenId
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
        kitchenId: itemData.kitchenId, // Store kitchen assignment
        itemStatus: 'PRINTED' as const,
        printedAt: new Date(),
      }));

      const savedOrderItems = await this.orderItemModel.insertMany(
        orderItems,
        { session },
      );

      // Step 6: Group items by kitchen
      const itemsByKitchen = new Map<
        string,
        { kitchenId: Types.ObjectId; kitchenName: string; items: any[] }
      >();

      savedOrderItems.forEach((orderItem) => {
        const kitchenKey = orderItem.kitchenId.toString();
        if (!itemsByKitchen.has(kitchenKey)) {
          // Find kitchen info from orderItemsData
          const itemData = orderItemsData.find(
            (d) => d.kitchenId.toString() === kitchenKey,
          );
          itemsByKitchen.set(kitchenKey, {
            kitchenId: orderItem.kitchenId,
            kitchenName: itemData?.kitchenName || 'Unknown Kitchen',
            items: [],
          });
        }
        itemsByKitchen.get(kitchenKey)!.items.push(orderItem);
      });

      // Step 7: Generate KOTs per kitchen
      const savedKots: KotDocument[] = [];
      const kotIds: Types.ObjectId[] = [];

      for (const [kitchenKey, kitchenGroup] of itemsByKitchen.entries()) {
        // Generate KOT number for this kitchen
        const kotNumber = await this.generateKotNumber(
          createOrderDto.outletId,
          kitchenGroup.kitchenId,
          session,
        );

        // Create KOT items for this kitchen
        const kotItems = kitchenGroup.items.map((orderItem) => ({
          orderItemId: orderItem._id,
          itemName: orderItem.itemName,
          variantName: orderItem.variantName,
          quantity: orderItem.quantity,
          specialInstructions: orderItem.specialInstructions,
        }));

        // Create KOT record
        const kotData = {
          orderId: savedOrder._id,
          restaurantId: createOrderDto.restaurantId,
          outletId: createOrderDto.outletId,
          kitchenId: kitchenGroup.kitchenId,
          kitchenName: kitchenGroup.kitchenName,
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
        savedKots.push(savedKot);
        kotIds.push(savedKot._id);

        // Update OrderItems with kotId for this kitchen
        await this.orderItemModel.updateMany(
          { _id: { $in: kitchenGroup.items.map((item) => item._id) } },
          { $set: { kotId: savedKot._id } },
          { session },
        );
      }

      // Step 8: Update Order with kotIds
      savedOrder.kotIds = kotIds;
      await savedOrder.save({ session });

      // Step 9: Commit transaction
      await session.commitTransaction();

      // Step 10: (Mock) Trigger event to TableService to mark table as OCCUPIED
      // This is done after transaction commit to avoid blocking
      await this.tableServiceClient.markTableOccupied(createOrderDto.tableId);

      // Step 11: Format response (return first KOT for backward compatibility, but include all KOTs)
      const kotResponses: KotResponseDto[] = savedKots.map((savedKot) => ({
        kotId: savedKot._id.toString(),
        kotNumber: savedKot.kotNumber,
        orderId: savedOrder._id.toString(),
        restaurantId: savedKot.restaurantId,
        outletId: savedKot.outletId,
        kitchenId: savedKot.kitchenId.toString(),
        kitchenName: savedKot.kitchenName,
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
      }));

      return {
        orderId: savedOrder._id.toString(),
        kot: kotResponses[0], // First KOT for backward compatibility
        kots: kotResponses, // All KOTs
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
  ): Promise<{ orderId: string; kot: KotResponseDto; kots?: KotResponseDto[] }> {
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

      // Step 2.1: Get outletId from POS session
      // We need outletId to resolve kitchens, but order doesn't store it
      // Get it from the first KOT if available, or from POS session
      let outletId: string;
      if (existingOrder.kotIds && existingOrder.kotIds.length > 0) {
        // Get outletId from first KOT
        const firstKot = await this.kotModel
          .findById(existingOrder.kotIds[0])
          .session(session)
          .exec();
        if (firstKot) {
          outletId = firstKot.outletId;
        } else {
          throw new BadRequestException(
            'Cannot determine outlet. KOT not found.',
          );
        }
      } else if (existingOrder.posSessionId) {
        // Fallback: Get from POS session (would need to add method to service)
        // For now, throw error - outletId should be available from KOTs
        throw new BadRequestException(
          'Cannot determine outlet. Order has no KOTs. Please contact support.',
        );
      } else {
        throw new BadRequestException(
          'Order does not have a POS session or KOTs. Cannot determine outlet.',
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

      // Step 3.1: Get default kitchen for outlet
      const defaultKitchen = await this.kitchenService.getDefaultKitchenOrFail(
        outletId,
      );

      // Step 3.2: Resolve kitchen for each new item
      // Priority: item-level kitchen > category-level kitchen > default kitchen
      const newOrderItemsData = await Promise.all(
        addItemsDto.items.map(async (item, index) => {
          const validatedItem = validatedItems[index];
          const totalPrice = validatedItem.price * item.quantity;

          // Prepare kitchen resolution input
          const resolutionInput: EnhancedKitchenResolutionInput = {
            itemKitchenId: validatedItem.kitchenId || null,
            itemKitchenName: null, // Will be fetched if item kitchen exists
            categoryKitchenId: validatedItem.categoryKitchenId || null,
            categoryKitchenName: validatedItem.categoryKitchenName || null,
            defaultKitchenId: defaultKitchen._id.toString(),
            defaultKitchenName: defaultKitchen.name,
          };

          // Fetch kitchen names if kitchen IDs are provided
          if (validatedItem.kitchenId) {
            const itemKitchen = await this.kitchenService.validateKitchen(
              validatedItem.kitchenId,
              outletId,
            );
            resolutionInput.itemKitchenName = itemKitchen.name;
          }

          if (validatedItem.categoryKitchenId && !validatedItem.categoryKitchenName) {
            try {
              const categoryKitchen = await this.kitchenService.validateKitchen(
                validatedItem.categoryKitchenId,
                outletId,
              );
              resolutionInput.categoryKitchenName = categoryKitchen.name;
            } catch (error) {
              // If category kitchen validation fails, it will fall back to default
              console.warn(
                `Category kitchen ${validatedItem.categoryKitchenId} validation failed, will use fallback`,
              );
            }
          }

          // Resolve kitchen using priority order
          const resolvedKitchen = resolveKitchenForItemEnhanced(resolutionInput);

          // Validate the resolved kitchen exists and is active
          const kitchen = await this.kitchenService.validateKitchen(
            resolvedKitchen.kitchenId,
            outletId,
          );

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
            kitchenId: new Types.ObjectId(resolvedKitchen.kitchenId),
            kitchenName: kitchen.name, // Use validated kitchen name
            itemStatus: 'PENDING' as const, // New items start as PENDING
          };
        }),
      );

      // Step 4: Calculate financial summaries for new items
      let newSubtotal = 0;
      newOrderItemsData.forEach((itemData) => {
        newSubtotal += itemData.totalPrice;
      });

      // Step 5: Create new OrderItems with status PENDING and kitchenId
      const orderItemsToInsert = newOrderItemsData.map((itemData) => ({
        orderId: itemData.orderId,
        menuItemId: itemData.menuItemId,
        variantId: itemData.variantId,
        itemName: itemData.itemName,
        variantName: itemData.variantName,
        price: itemData.price,
        quantity: itemData.quantity,
        totalPrice: itemData.totalPrice,
        specialInstructions: itemData.specialInstructions,
        kitchenId: itemData.kitchenId, // Store kitchen assignment
        itemStatus: itemData.itemStatus,
      }));

      const savedNewOrderItems = await this.orderItemModel.insertMany(
        orderItemsToInsert,
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

      // Step 6.1: Group new items by kitchen
      const itemsByKitchen = new Map<
        string,
        { kitchenId: Types.ObjectId; kitchenName: string; items: any[] }
      >();

      savedNewOrderItems.forEach((orderItem, index) => {
        const itemData = newOrderItemsData[index];
        const kitchenKey = itemData.kitchenId.toString();
        if (!itemsByKitchen.has(kitchenKey)) {
          itemsByKitchen.set(kitchenKey, {
            kitchenId: itemData.kitchenId,
            kitchenName: itemData.kitchenName,
            items: [],
          });
        }
        itemsByKitchen.get(kitchenKey)!.items.push(orderItem);
      });

      // Step 7: Generate delta KOTs per kitchen
      const savedKots: KotDocument[] = [];
      const newKotIds: Types.ObjectId[] = [];

      for (const [kitchenKey, kitchenGroup] of itemsByKitchen.entries()) {
        // Generate KOT number for this kitchen
        const kotNumber = await this.generateKotNumber(
          outletId,
          kitchenGroup.kitchenId,
          session,
        );

        // Create KOT items for this kitchen
        const kotItems = kitchenGroup.items.map((orderItem) => ({
          orderItemId: orderItem._id,
          itemName: orderItem.itemName,
          variantName: orderItem.variantName,
          quantity: orderItem.quantity,
          specialInstructions: orderItem.specialInstructions,
        }));

        // Create Delta KOT record
        const kotData = {
          orderId: existingOrder._id,
          restaurantId: existingOrder.restaurantId,
          outletId,
          kitchenId: kitchenGroup.kitchenId,
          kitchenName: kitchenGroup.kitchenName,
          tableId: existingOrder.tableId,
          kotNumber,
          items: kotItems, // Only new items for this kitchen
          status: 'PRINTED' as const,
          printedAt: new Date(),
          printedBy: existingOrder.waiterId,
        };

        const kot = new this.kotModel(kotData);
        const savedKot = await kot.save({ session });
        savedKots.push(savedKot);
        newKotIds.push(savedKot._id);

        // Update OrderItems with kotId for this kitchen
        await this.orderItemModel.updateMany(
          { _id: { $in: kitchenGroup.items.map((item) => item._id) } },
          {
            $set: {
              itemStatus: 'PRINTED',
              kotId: savedKot._id,
              printedAt: new Date(),
            },
          },
          { session },
        );
      }

      // Step 8: Update Order with new kotIds
      const updatedKotIds = [
        ...(existingOrder.kotIds || []),
        ...newKotIds,
      ];
      await this.orderModel.findByIdAndUpdate(
        existingOrder._id,
        {
          $set: {
            subtotal: updatedSubtotal,
            tax: updatedTax,
            discount: updatedDiscount,
            total: updatedTotal,
            kotIds: updatedKotIds,
          },
        },
        { session, new: true },
      );

      // Step 9: Commit transaction
      await session.commitTransaction();

      // Step 10: Format response
      const kotResponses: KotResponseDto[] = savedKots.map((savedKot) => ({
        kotId: savedKot._id.toString(),
        kotNumber: savedKot.kotNumber,
        orderId: existingOrder._id.toString(),
        restaurantId: savedKot.restaurantId,
        outletId: savedKot.outletId,
        kitchenId: savedKot.kitchenId.toString(),
        kitchenName: savedKot.kitchenName,
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
      }));

      return {
        orderId: existingOrder._id.toString(),
        kot: kotResponses[0], // First KOT for backward compatibility
        kots: kotResponses, // All delta KOTs
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

      // Step 3.1: Check if POS session has Z-Report (locked)
      if (existingOrder.posSessionId) {
        const posSession = await this.posSessionService.findOne(
          existingOrder.posSessionId.toString(),
        );
        if (posSession?.zReportId) {
          throw new BadRequestException(
            'Cannot settle order. Z-Report has been generated for this session. All orders are locked.',
          );
        }
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
      const paymentData: any = {
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

      // Attach POS session ID if order has one
      if (existingOrder.posSessionId) {
        paymentData.posSessionId = existingOrder.posSessionId;
      }

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

      // Step 7: Update POS Session totals if session exists
      if (existingOrder.posSessionId) {
        await this.posSessionService.updateSessionOnOrderSettlement(
          existingOrder.posSessionId,
          paidAmount,
          settleOrderDto.paymentMethod,
          session,
        );
      }

      // Step 8: Commit transaction
      await session.commitTransaction();

      // Step 9: (Mock) Trigger event to TableService to mark table as VACANT
      // This is done after transaction commit to avoid blocking
      if (existingOrder.tableId) {
        await this.tableServiceClient.markTableVacant(
          existingOrder.tableId.toString(),
        );
      }

      // Step 10: (Mock) Trigger event to InventoryService to deduct stock
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

      // Step 11: Format response
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

  /**
   * Find KOTs with filters
   */
  async findKots(filters: {
    kitchenId?: string;
    outletId?: string;
    date?: string;
    status?: 'PRINTED' | 'CANCELLED';
  }): Promise<KotResponseDto[]> {
    const query: any = {};

    if (filters.kitchenId) {
      query.kitchenId = new Types.ObjectId(filters.kitchenId);
    }

    if (filters.outletId) {
      query.outletId = filters.outletId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.date) {
      // Parse date and create date range for the day
      const date = new Date(filters.date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const kots = await this.kotModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return kots.map((kot) => this.toKotResponseDto(kot));
  }

  /**
   * Find KOT by ID
   */
  async findKotById(kotId: string): Promise<KotResponseDto> {
    const kot = await this.kotModel.findById(kotId).exec();

    if (!kot) {
      throw new NotFoundException(`KOT with ID ${kotId} not found`);
    }

    return this.toKotResponseDto(kot);
  }

  /**
   * Reprint KOT
   */
  async reprintKot(kotId: string, printedBy?: string): Promise<KotResponseDto> {
    const kot = await this.kotModel.findById(kotId).exec();

    if (!kot) {
      throw new NotFoundException(`KOT with ID ${kotId} not found`);
    }

    // Update printed timestamp (reprint)
    kot.printedAt = new Date();
    if (printedBy) {
      kot.printedBy = printedBy;
    }

    const updatedKot = await kot.save();
    return this.toKotResponseDto(updatedKot);
  }

  /**
   * Cancel KOT
   */
  async cancelKot(kotId: string, cancelledBy?: string): Promise<KotResponseDto> {
    const kot = await this.kotModel.findById(kotId).exec();

    if (!kot) {
      throw new NotFoundException(`KOT with ID ${kotId} not found`);
    }

    if (kot.status === 'CANCELLED') {
      throw new BadRequestException('KOT is already cancelled');
    }

    kot.status = 'CANCELLED';
    kot.cancelledAt = new Date();
    if (cancelledBy) {
      // Store cancelledBy if needed (could add field to schema)
    }

    const updatedKot = await kot.save();

    // Update order items status to CANCELLED
    await this.orderItemModel.updateMany(
      { kotId: kot._id },
      {
        $set: {
          itemStatus: 'CANCELLED',
          cancelledAt: new Date(),
        },
      },
    );

    return this.toKotResponseDto(updatedKot);
  }

  /**
   * Convert KOT document to response DTO
   */
  private toKotResponseDto(kot: KotDocument): KotResponseDto {
    return {
      kotId: kot._id.toString(),
      kotNumber: kot.kotNumber,
      orderId: kot.orderId.toString(),
      restaurantId: kot.restaurantId,
      outletId: kot.outletId,
      kitchenId: kot.kitchenId.toString(),
      kitchenName: kot.kitchenName,
      tableId: kot.tableId?.toString(),
      items: kot.items.map((item) => ({
        orderItemId: item.orderItemId.toString(),
        itemName: item.itemName,
        variantName: item.variantName,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
      })),
      status: kot.status,
      printedAt: kot.printedAt,
      printedBy: kot.printedBy,
      notes: kot.notes,
    };
  }
}
