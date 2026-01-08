// src/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
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
import { KotReprintDto } from './dto/kot-reprint.dto';
import { KotCancelDto } from './dto/kot-cancel.dto';
import { KotTransferDto } from './dto/kot-transfer.dto';
import { TableServiceClient } from './services/table-service.client';
import { MenuServiceClient } from './services/menu-service.client';
import { TaxConfigService } from './services/tax-config.service';
import { InventoryServiceClient } from './services/inventory-service.client';
import {
  PosSessionService,
  PosSessionDocument,
} from '../pos-session/pos-session.service';
import { KitchenService } from '../kitchen/kitchen.service';
import { CoursesService } from '../courses/courses.service';
import {
  EnhancedKitchenResolutionInput,
  resolveKitchenForItemEnhanced,
} from './utils/kitchen-resolution.util';
import { VoidBillDto, VoidBillResponseDto } from './dto/void-bill.dto';
import { SettleCreditDto } from './dto/settle-credit.dto';
import {
  calculateRoundOff,
  getDefaultRoundOffConfig,
} from './utils/round-off.util';
import { RestaurantServiceClient } from './services/restaurant-service.client';
import { FireCourseDto } from '../courses/dto/fire-course.dto';
import { CourseResponseDto } from '../courses/dto/course-response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

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
    private coursesService: CoursesService,
    private restaurantServiceClient: RestaurantServiceClient,
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
      const orderType: Order['orderType'] =
        createDraftDto.orderType === 'TAKEAWAY' ? 'TAKEAWAY' : 'DINE_IN';

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

      // Step 2.1: Get default kitchen and default course for outlet
      const defaultKitchen = await this.kitchenService.getDefaultKitchenOrFail(
        createOrderDto.outletId,
      );
      const defaultCourse = await this.coursesService.findDefaultCourse(
        createOrderDto.outletId,
      );

      if (!defaultCourse) {
        throw new BadRequestException(
          'No default course found for this outlet. Please create a default course first.',
        );
      }

      // Step 2.2: Resolve kitchen and course for each item
      // Kitchen Priority: item-level > category-level > default kitchen
      // Course Priority: item-level > category-level > default course
      const orderItemsData = await Promise.all(
        createOrderDto.items.map(async (item, index) => {
          if (!item.recipeSnapshot || item.recipeSnapshot.length === 0) {
            throw new BadRequestException(
              `Missing recipe snapshot for menu item ${item.menuItemId}`,
            );
          }

          const validatedItem = validatedItems[index];
          const totalPrice = validatedItem.price * item.quantity;

          // Resolve kitchen
          const resolutionInput: EnhancedKitchenResolutionInput = {
            itemKitchenId: validatedItem.kitchenId || null,
            itemKitchenName: null,
            categoryKitchenId: validatedItem.categoryKitchenId || null,
            categoryKitchenName: validatedItem.categoryKitchenName || null,
            defaultKitchenId: defaultKitchen._id.toString(),
            defaultKitchenName: defaultKitchen.name,
          };

          if (validatedItem.kitchenId) {
            const itemKitchen = await this.kitchenService.validateKitchen(
              validatedItem.kitchenId,
              createOrderDto.outletId,
            );
            resolutionInput.itemKitchenName = itemKitchen.name;
          }

          if (validatedItem.categoryKitchenId && !validatedItem.categoryKitchenName) {
            try {
              const categoryKitchen = await this.kitchenService.validateKitchen(
                validatedItem.categoryKitchenId,
                createOrderDto.outletId,
              );
              resolutionInput.categoryKitchenName = categoryKitchen.name;
            } catch (error) {
              console.warn(
                `Category kitchen ${validatedItem.categoryKitchenId} validation failed, will use fallback`,
              );
            }
          }

          const resolvedKitchen = resolveKitchenForItemEnhanced(resolutionInput);
          const kitchen = await this.kitchenService.validateKitchen(
            resolvedKitchen.kitchenId,
            createOrderDto.outletId,
          );

          // Resolve course (item-level > category-level > default)
          let courseId: Types.ObjectId;
          let courseName: string;
          let courseSequence: number;

          // TODO: Check item-level course (if implemented in menu-service)
          // For now, use category-level or default
          if (validatedItem.categoryCourseId) {
            const categoryCourse = await this.coursesService.validateCourse(
              validatedItem.categoryCourseId,
              createOrderDto.outletId,
            );
            courseId = categoryCourse._id;
            courseName = categoryCourse.name;
            courseSequence = categoryCourse.sequence;
          } else {
            // Use default course
            courseId = defaultCourse._id;
            courseName = defaultCourse.name;
            courseSequence = defaultCourse.sequence;
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
            recipeSnapshot: item.recipeSnapshot,
            kitchenId: new Types.ObjectId(resolvedKitchen.kitchenId),
            kitchenName: kitchen.name,
            courseId,
            courseName,
            courseSequence,
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
        outletId: createOrderDto.outletId,
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

      // Step 5: Create OrderItems with kitchenId and courseId (snapshot)
      // Also handle complimentary items from order creation
      const orderItems = createOrderDto.items.map((itemInput, index) => {
        const itemData = orderItemsData[index];
        const isComplimentary = itemInput.isComplimentary || false;

        return {
          orderId: savedOrder._id,
          menuItemId: itemData.menuItemId,
          variantId: itemData.variantId,
          itemName: itemData.itemName,
          variantName: itemData.variantName,
          price: isComplimentary ? 0 : itemData.price, // Set price to 0 if complimentary
          quantity: itemData.quantity,
          totalPrice: isComplimentary ? 0 : itemData.totalPrice, // Set totalPrice to 0 if complimentary
          specialInstructions: itemData.specialInstructions,
          recipeSnapshot: itemData.recipeSnapshot,
          kitchenId: itemData.kitchenId, // Store kitchen assignment
          courseId: itemData.courseId, // Store course assignment (snapshot)
          courseName: itemData.courseName, // Store course name (snapshot)
          courseSequence: itemData.courseSequence, // Store course sequence (snapshot)
          itemStatus: 'PENDING' as const, // Will be updated to PRINTED when KOT is printed
          // Complimentary item fields
          isComplimentary,
          complimentaryReason: isComplimentary
            ? itemInput.complimentaryReason || 'Complimentary item'
            : undefined,
          taxableAmount: isComplimentary ? 0 : itemData.totalPrice,
          taxAmount: 0, // Will be calculated during billing
          finalItemTotal: isComplimentary ? 0 : itemData.totalPrice,
        };
      });

      const savedOrderItems = await this.orderItemModel.insertMany(
        orderItems,
        { session },
      );

      // Step 6: Group items by kitchen + course (Petpooja-style)
      // groupKey = kitchenId + courseId
      const itemsByKitchenAndCourse = new Map<
        string,
        {
          kitchenId: Types.ObjectId;
          kitchenName: string;
          courseId: Types.ObjectId;
          courseName: string;
          courseCode: string;
          courseSequence: number;
          items: any[];
        }
      >();

      // Fetch course codes for all unique courses
      const uniqueCourseIds = [
        ...new Set(orderItemsData.map((item) => item.courseId.toString())),
      ];
      const coursesMap = new Map<string, { code: string; sequence: number }>();
      for (const courseId of uniqueCourseIds) {
        const course = await this.coursesService.findOne(courseId);
        coursesMap.set(courseId, {
          code: course.code,
          sequence: course.sequence,
        });
      }

      savedOrderItems.forEach((orderItem, index) => {
        const itemData = orderItemsData[index];
        const groupKey = `${orderItem.kitchenId!.toString()}_${orderItem.courseId!.toString()}`;
        const courseInfo = coursesMap.get(orderItem.courseId!.toString());

        if (!itemsByKitchenAndCourse.has(groupKey)) {
          itemsByKitchenAndCourse.set(groupKey, {
            kitchenId: orderItem.kitchenId!,
            kitchenName: itemData.kitchenName,
            courseId: orderItem.courseId!,
            courseName: itemData.courseName,
            courseCode: courseInfo?.code || 'UNKNOWN',
            courseSequence: itemData.courseSequence,
            items: [],
          });
        }
        itemsByKitchenAndCourse.get(groupKey)!.items.push(orderItem);
      });

      // Step 7: Generate KOTs per kitchen + course combination
      const savedKots: KotDocument[] = [];
      const kotIds: Types.ObjectId[] = [];

      for (const [groupKey, group] of itemsByKitchenAndCourse.entries()) {
        // Generate KOT number for this kitchen (per kitchen, not per course)
        const kotNumber = await this.generateKotNumber(
          createOrderDto.outletId,
          group.kitchenId,
          session,
        );

        // Create KOT items for this kitchen + course combination
        const kotItems = group.items.map((orderItem) => ({
          orderItemId: orderItem._id,
          itemName: orderItem.itemName,
          variantName: orderItem.variantName,
          quantity: orderItem.quantity,
          specialInstructions: orderItem.specialInstructions,
        }));

        // Determine KOT status based on course
        // STARTER courses (sequence 1) are printed immediately, others are PENDING
        const isStarterCourse = group.courseSequence === 1 || group.courseCode === 'STARTER';
        const kotStatus: 'PENDING' | 'PRINTED' = isStarterCourse ? 'PRINTED' : 'PENDING';

        // Create KOT record
        const kotData = {
          orderId: savedOrder._id,
          restaurantId: createOrderDto.restaurantId,
          outletId: createOrderDto.outletId,
          kitchenId: group.kitchenId,
          kitchenName: group.kitchenName,
          courseId: group.courseId,
          courseName: group.courseName,
          courseSequence: group.courseSequence,
          tableId,
          kotNumber,
          items: kotItems,
          status: kotStatus,
          printedAt: kotStatus === 'PRINTED' ? new Date() : undefined,
          printedBy: kotStatus === 'PRINTED' ? createOrderDto.waiterId : undefined,
          notes: createOrderDto.notes,
        };

        const kot = new this.kotModel(kotData);
        const savedKot = await kot.save({ session });
        savedKots.push(savedKot);
        kotIds.push(savedKot._id);

        // Update OrderItems with kotId and itemStatus
        const updateData: any = { kotId: savedKot._id };
        if (kotStatus === 'PRINTED') {
          updateData.itemStatus = 'PRINTED';
          updateData.printedAt = new Date();
        }

        await this.orderItemModel.updateMany(
          { _id: { $in: group.items.map((item) => item._id) } },
          { $set: updateData },
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
        type: savedKot.type,
        parentKotId: savedKot.parentKotId?.toString(),
        actionReason: savedKot.actionReason,
        cancelledAt: savedKot.cancelledAt,
        cancelledByUserId: savedKot.cancelledByUserId,
        courseId: savedKot.courseId?.toString(),
        courseName: savedKot.courseName,
        courseSequence: savedKot.courseSequence,
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
          if (!item.recipeSnapshot || item.recipeSnapshot.length === 0) {
            throw new BadRequestException(
              `Missing recipe snapshot for menu item ${item.menuItemId}`,
            );
          }

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
            recipeSnapshot: item.recipeSnapshot,
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
        recipeSnapshot: itemData.recipeSnapshot,
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
        type: savedKot.type,
        parentKotId: savedKot.parentKotId?.toString(),
        actionReason: savedKot.actionReason,
        cancelledAt: savedKot.cancelledAt,
        cancelledByUserId: savedKot.cancelledByUserId,
        courseId: savedKot.courseId?.toString(),
        courseName: savedKot.courseName,
        courseSequence: savedKot.courseSequence,
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

      // Step 5: Calculate subtotal from non-complimentary items only
      // Complimentary items have zero value and zero tax
      const subtotal = allOrderItems
        .filter((item) => !item.isComplimentary)
        .reduce((sum, item) => sum + item.totalPrice, 0);

      // Calculate total complimentary items value (for reporting)
      const totalComplimentaryItemsValue = allOrderItems
        .filter((item) => item.isComplimentary)
        .reduce((sum, item) => {
          // Use original price before making complimentary
          const originalPrice = item.price || 0;
          const originalQuantity = item.quantity || 0;
          return sum + originalPrice * originalQuantity;
        }, 0);

      // Step 6: Get tax configuration and calculate taxes (only on non-complimentary items)
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

      // Step 8: Calculate gross amount (before round-off)
      const grossAmount = subtotal + totalTax - discount;

      // Step 9: Apply round-off (Indian billing - Petpooja style)
      // Get outlet billing config (get outletId from POS session or KOTs)
      let outletId: string | undefined;
      if (existingOrder.posSessionId) {
        const posSession = await this.posSessionService.findOne(
          existingOrder.posSessionId.toString(),
        );
        outletId = posSession?.outletId;
      }

      let billingConfig;
      if (outletId) {
        billingConfig = await this.restaurantServiceClient.getOutletBillingConfig(
          outletId,
        );
      }

      // Use default config if not available
      const roundOffConfig = billingConfig?.roundOff || getDefaultRoundOffConfig();

      const roundOffResult = calculateRoundOff(grossAmount, roundOffConfig);

      // Step 10: Generate bill number
      const billNumber = await this.generateBillNumber(
        existingOrder.restaurantId,
        session,
      );

      // Step 11: Update Order status to BILLED (only if no unprinted items)
      const updateData: any = {
        billNumber,
        subtotal,
        tax: totalTax,
        discount,
        total: roundOffResult.grossAmount, // Keep for backward compatibility
        grossAmount: roundOffResult.grossAmount,
        roundOffAmount: roundOffResult.roundOffAmount,
        netPayable: roundOffResult.netPayable,
        billedAt: new Date(),
      };

      if (!hasUnprintedItems) {
        updateData.status = 'BILLED';
      }

      await this.orderModel.findByIdAndUpdate(
        existingOrder._id,
        { $set: updateData },
        { session, new: true },
      );

      // Step 11: Commit transaction
      await session.commitTransaction();

      // Step 12: (Mock) Trigger event to TableService to mark table as BILLED
      // This is done after transaction commit to avoid blocking
      if (existingOrder.tableId && !hasUnprintedItems) {
        await this.tableServiceClient.markTableBilled(
          existingOrder.tableId.toString(),
        );
      }

      // Step 12: Format bill response
      const billItems: BillItemDto[] = allOrderItems.map((item) => ({
        orderItemId: item._id.toString(),
        menuItemId: item.menuItemId,
        itemName: item.itemName,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        specialInstructions: item.specialInstructions,
        isComplimentary: item.isComplimentary || false,
        complimentaryReason: item.complimentaryReason,
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
        totalCOGS: existingOrder.totalCOGS,
        grossAmount: roundOffResult.grossAmount,
        roundOffAmount: roundOffResult.roundOffAmount,
        netPayable: roundOffResult.netPayable,
        grandTotal: roundOffResult.netPayable, // Use netPayable for backward compatibility
        totalComplimentaryItemsValue,
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

      // Step 2.1: Disallow settlement for cancelled/voided orders
      if (existingOrder.status === 'CANCELLED') {
        throw new BadRequestException(
          `Order with ID ${settleOrderDto.orderId} is cancelled and cannot be completed`,
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
      // Use netPayable if available (after round-off), otherwise use total
      const billTotal = existingOrder.netPayable || existingOrder.total;
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

      // If payment method is CREDIT, add credit details
      if (settleOrderDto.paymentMethod === 'CREDIT') {
        paymentData.creditDetails = {
          customerName: existingOrder.customerPhone || 'Unknown Customer',
          customerPhone: existingOrder.customerPhone,
          isSettled: false,
        };
      }

      // Attach POS session ID if order has one
      if (existingOrder.posSessionId) {
        paymentData.posSessionId = existingOrder.posSessionId;
      }

      const payment = new this.paymentModel(paymentData);
      const savedPayment = await payment.save({ session });

      // Step 6: Load order items with recipe snapshots for inventory consumption
      const orderItems = await this.orderItemModel
        .find({ orderId: existingOrder._id })
        .session(session)
        .exec();

      if (!orderItems.length) {
        throw new BadRequestException(
          `Order ${existingOrder._id.toString()} has no items to consume`,
        );
      }

      const itemsMissingSnapshot = orderItems.filter(
        (item) => !item.recipeSnapshot || item.recipeSnapshot.length === 0,
      );

      if (itemsMissingSnapshot.length > 0) {
        const missingIds = itemsMissingSnapshot
          .map((item) => item.menuItemId)
          .join(', ');
        throw new BadRequestException(
          `Recipe snapshot missing for items: ${missingIds}`,
        );
      }

      // Step 6.1: Resolve outletId (prefer stored value, fallback to first KOT)
      let outletId = existingOrder.outletId;
      if (!outletId) {
        if (!existingOrder.kotIds || existingOrder.kotIds.length === 0) {
          throw new BadRequestException(
            'Cannot determine outlet for this order (no KOTs found).',
          );
        }

        const firstKot = await this.kotModel
          .findById(existingOrder.kotIds[0])
          .session(session)
          .exec();

        if (!firstKot?.outletId) {
          throw new BadRequestException(
            'Cannot determine outlet for this order (KOT missing or invalid).',
          );
        }
        outletId = firstKot.outletId;
      }

      // Step 6.2: Trigger inventory consumption BEFORE completing order
      const inventoryPayload = {
        orderId: existingOrder._id.toString(),
        restaurantId: existingOrder.restaurantId,
        outletId,
        items: orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          menuItemName: item.itemName,
          quantityOrdered: item.quantity,
          recipeSnapshot: item.recipeSnapshot,
        })),
      };

      const inventoryResult =
        await this.inventoryServiceClient.consumeInventory(inventoryPayload);

      // Step 6.3: Compute immutable COGS snapshot (idempotent)
      const totalCOGS = await this.computeCogsSnapshot(
        existingOrder,
        orderItems,
        session,
      );

      // Step 7: Update Order Status to COMPLETED
      await this.orderModel.findByIdAndUpdate(
        existingOrder._id,
        {
          $set: {
            status: 'COMPLETED',
            completedAt: new Date(),
            outletId,
            totalCOGS,
          },
        },
        { session, new: true },
      );

      // Step 8: Update POS Session totals if session exists
      if (existingOrder.posSessionId) {
        await this.posSessionService.updateSessionOnOrderSettlement(
          existingOrder.posSessionId,
          paidAmount,
          settleOrderDto.paymentMethod,
          session,
        );
      }

      // Step 9: Commit transaction
      await session.commitTransaction();

      // Step 10: (Mock) Trigger event to TableService to mark table as VACANT
      // This is done after transaction commit to avoid blocking
      if (existingOrder.tableId) {
        await this.tableServiceClient.markTableVacant(
          existingOrder.tableId.toString(),
        );
      }

      const totalRawMaterials = inventoryPayload.items.reduce(
        (count, item) => count + item.recipeSnapshot.length,
        0,
      );

      this.logger.log('Inventory consumed on order completion', {
        orderId: existingOrder._id.toString(),
        totalRawMaterials,
        ledgerEntryIds: inventoryResult?.ledgerEntryIds || [],
        totalCOGS,
      });

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
        totalCOGS,
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
      type: kot.type || 'NORMAL',
      parentKotId: kot.parentKotId?.toString(),
      actionReason: kot.actionReason,
      items: kot.items.map((item) => ({
        orderItemId: item.orderItemId.toString(),
        itemName: item.itemName,
        variantName: item.variantName,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        status: item.status || 'ACTIVE',
      })),
      status: kot.status,
      printedAt: kot.printedAt,
      printedBy: kot.printedBy,
      cancelledAt: kot.cancelledAt,
      cancelledByUserId: kot.cancelledByUserId,
      notes: kot.notes,
      courseId: kot.courseId?.toString(),
      courseName: kot.courseName,
      courseSequence: kot.courseSequence,
    };
  }

  private toPlainKotItem(item: any) {
    return typeof item?.toObject === 'function' ? item.toObject() : item;
  }

  /**
   * Compute immutable COGS snapshot for an order's items.
   * Must be called inside the same transaction as completion.
   */
  private async computeCogsSnapshot(
    order: OrderDocument,
    orderItems: OrderItemDocument[],
    session: ClientSession,
  ): Promise<number> {
    const itemsHaveCogs = orderItems.every(
      (item) => item.cogs?.breakdown && item.cogs.breakdown.length > 0,
    );
    if (order.totalCOGS !== undefined && itemsHaveCogs) {
      return order.totalCOGS || 0;
    }

    const rawMaterialIds = Array.from(
      new Set(
        orderItems.flatMap((item) =>
          (item.recipeSnapshot || []).map((c) => c.rawMaterialId),
        ),
      ),
    );

    if (!rawMaterialIds.length) {
      throw new BadRequestException(
        'Cannot compute COGS: recipe snapshot missing',
      );
    }

    const costSnapshot =
      await this.inventoryServiceClient.getRawMaterialCostSnapshot(
        rawMaterialIds,
      );

    const contributorMap = new Map<
      string,
      { rawMaterialId: string; rawMaterialName: string; cost: number }
    >();

    const bulkOps: any[] = [];
    let orderTotalCOGS = 0;

    for (const item of orderItems) {
      const breakdown =
        (item.recipeSnapshot || []).map((component) => {
          const quantityConsumed = item.quantity * component.quantityPerUnit;
          if (!Number.isFinite(quantityConsumed) || quantityConsumed <= 0) {
            throw new BadRequestException(
              `Invalid quantity consumed for raw material ${component.rawMaterialId}`,
            );
          }

          const costEntry = costSnapshot[component.rawMaterialId];
          if (costEntry === undefined || costEntry.averageCost === undefined) {
            throw new BadRequestException(
              `Average cost missing for raw material ${component.rawMaterialId}`,
            );
          }

          const unitCost = Number(costEntry.averageCost) || 0;
          const cost = quantityConsumed * unitCost;

          const existing = contributorMap.get(component.rawMaterialId);
          if (existing) {
            existing.cost += cost;
          } else {
            contributorMap.set(component.rawMaterialId, {
              rawMaterialId: component.rawMaterialId,
              rawMaterialName: component.rawMaterialName,
              cost,
            });
          }

          return {
            rawMaterialId: component.rawMaterialId,
            rawMaterialName: component.rawMaterialName,
            quantityConsumed,
            unitCost,
            cost,
          };
        }) || [];

      const itemTotalCost = breakdown.reduce(
        (sum, comp) => sum + comp.cost,
        0,
      );
      orderTotalCOGS += itemTotalCost;

      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              'cogs.totalCost': itemTotalCost,
              'cogs.breakdown': breakdown,
            },
          },
        },
      });
    }

    if (bulkOps.length) {
      await this.orderItemModel.bulkWrite(bulkOps, { session });
    }

    await this.orderModel.updateOne(
      { _id: order._id },
      { $set: { totalCOGS: orderTotalCOGS } },
      { session },
    );

    const topContributors = Array.from(contributorMap.values())
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 3)
      .map((c) => ({
        id: c.rawMaterialId,
        name: c.rawMaterialName,
        cost: c.cost,
      }));

    this.logger.log('COGS snapshot captured', {
      orderId: order._id.toString(),
      totalCOGS: orderTotalCOGS,
      topContributors,
      rawMaterialIds,
    });

    return orderTotalCOGS;
  }

  /**
   * Reprint a KOT (Petpooja-style)
   * Creates a new REPRINT type KOT with same kotNumber and items
   * Original KOT remains unchanged
   */
  async reprintKot(
    kotId: string,
    reprintDto: KotReprintDto,
    userId: string,
  ): Promise<KotResponseDto> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Find original KOT
      const originalKot = await this.kotModel
        .findById(kotId)
        .session(session)
        .exec();

      if (!originalKot) {
        throw new NotFoundException(`KOT with ID ${kotId} not found`);
      }

      // Step 2: Validate KOT is PRINTED
      if (originalKot.status !== 'PRINTED') {
        throw new BadRequestException(
          `Cannot reprint KOT with status ${originalKot.status}. Only PRINTED KOTs can be reprinted.`,
        );
      }

      // Step 3: Validate POS session is open
      const activeSession = await this.posSessionService.findActiveSession(
        originalKot.outletId,
      );
      if (!activeSession) {
        throw new BadRequestException(
          'No active POS session found. Cannot reprint KOT.',
        );
      }

      // Step 4: Create REPRINT KOT with same kotNumber and items
      const reprintKot = new this.kotModel({
        orderId: originalKot.orderId,
        restaurantId: originalKot.restaurantId,
        outletId: originalKot.outletId,
        kitchenId: originalKot.kitchenId,
        kitchenName: originalKot.kitchenName,
        courseId: originalKot.courseId, // Copy course fields from original
        courseName: originalKot.courseName,
        courseSequence: originalKot.courseSequence,
        tableId: originalKot.tableId,
        kotNumber: originalKot.kotNumber, // Same kotNumber
        items: originalKot.items.map((item) => ({
          ...this.toPlainKotItem(item),
          status: 'ACTIVE', // All items remain ACTIVE in reprint
        })),
        type: 'REPRINT',
        parentKotId: originalKot._id,
        actionReason: reprintDto.reason,
        status: 'PRINTED',
        printedAt: new Date(),
        printedBy: userId,
        notes: originalKot.notes,
      });

      const savedReprintKot = await reprintKot.save({ session });

      await session.commitTransaction();

      return this.toKotResponseDto(savedReprintKot);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel a KOT (Full or Partial)
   * Creates a new CANCELLATION type KOT
   * Original KOT remains unchanged
   */
  async cancelKot(
    kotId: string,
    cancelDto: KotCancelDto,
    userId: string,
  ): Promise<KotResponseDto> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Find original KOT
      const originalKot = await this.kotModel
        .findById(kotId)
        .session(session)
        .exec();

      if (!originalKot) {
        throw new NotFoundException(`KOT with ID ${kotId} not found`);
      }

      // Step 2: Validate KOT is PRINTED
      if (originalKot.status !== 'PRINTED') {
        throw new BadRequestException(
          `Cannot cancel KOT with status ${originalKot.status}. Only PRINTED KOTs can be cancelled.`,
        );
      }

      // Step 3: Validate POS session is open
      const activeSession = await this.posSessionService.findActiveSession(
        originalKot.outletId,
      );
      if (!activeSession) {
        throw new BadRequestException(
          'No active POS session found. Cannot cancel KOT.',
        );
      }

      // Step 4: Determine items to cancel
      let itemsToCancel: typeof originalKot.items;

      if (cancelDto.items && cancelDto.items.length > 0) {
        // Partial cancellation - validate items
        itemsToCancel = [];

        for (const cancelItem of cancelDto.items) {
          // Find matching item in original KOT by orderItemId
          const kotItem = originalKot.items.find(
            (item) => item.orderItemId.toString() === cancelItem.orderItemId,
          );

          if (!kotItem) {
            throw new BadRequestException(
              `Order item ${cancelItem.orderItemId} not found in KOT`,
            );
          }

          // Check if item is already cancelled or transferred
          if (kotItem.status === 'CANCELLED' || kotItem.status === 'TRANSFERRED') {
            throw new BadRequestException(
              `Item ${cancelItem.orderItemId} is already ${kotItem.status.toLowerCase()}`,
            );
          }

          // Validate quantity
          if (cancelItem.quantity > kotItem.quantity) {
            throw new BadRequestException(
              `Cannot cancel ${cancelItem.quantity} of order item ${cancelItem.orderItemId}. Only ${kotItem.quantity} available.`,
            );
          }

          itemsToCancel.push({
            ...this.toPlainKotItem(kotItem),
            quantity: cancelItem.quantity,
            status: 'CANCELLED',
          });
        }
      } else {
        // Full cancellation - cancel all items
        itemsToCancel = originalKot.items.map((item) => ({
          ...this.toPlainKotItem(item),
          status: 'CANCELLED',
        }));
      }

      // Step 5: Create CANCELLATION KOT
      const cancellationKot = new this.kotModel({
        orderId: originalKot.orderId,
        restaurantId: originalKot.restaurantId,
        outletId: originalKot.outletId,
        kitchenId: originalKot.kitchenId,
        kitchenName: originalKot.kitchenName,
        courseId: originalKot.courseId, // Copy course fields from original
        courseName: originalKot.courseName,
        courseSequence: originalKot.courseSequence,
        tableId: originalKot.tableId,
        kotNumber: originalKot.kotNumber, // Same kotNumber
        items: itemsToCancel,
        type: 'CANCELLATION',
        parentKotId: originalKot._id,
        actionReason: cancelDto.reason,
        status: 'PRINTED',
        printedAt: new Date(),
        printedBy: userId,
        cancelledAt: new Date(),
        cancelledByUserId: userId,
        notes: `Cancellation: ${cancelDto.reason}`,
      });

      const savedCancellationKot = await cancellationKot.save({ session });

      // Step 6: Update order items status (mark as cancelled)
      const orderItemIds = itemsToCancel.map((item) => item.orderItemId);
      await this.orderItemModel.updateMany(
        {
          _id: { $in: orderItemIds },
          orderId: originalKot.orderId,
        },
        {
          $set: {
            itemStatus: 'CANCELLED',
            cancelledAt: new Date(),
          },
        },
        { session },
      );

      await session.commitTransaction();

      return this.toKotResponseDto(savedCancellationKot);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Transfer KOT items to another kitchen (Petpooja-style)
   * Creates 2 KOTs:
   * 1. CANCELLATION KOT in source kitchen
   * 2. NORMAL KOT in destination kitchen
   * Must be transactional
   */
  async transferKot(
    kotId: string,
    transferDto: KotTransferDto,
    userId: string,
  ): Promise<{ cancellationKot: KotResponseDto; transferKot: KotResponseDto }> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Find original KOT
      const originalKot = await this.kotModel
        .findById(kotId)
        .session(session)
        .exec();

      if (!originalKot) {
        throw new NotFoundException(`KOT with ID ${kotId} not found`);
      }

      // Step 2: Validate KOT is PRINTED
      if (originalKot.status !== 'PRINTED') {
        throw new BadRequestException(
          `Cannot transfer KOT with status ${originalKot.status}. Only PRINTED KOTs can be transferred.`,
        );
      }

      // Step 3: Validate POS session is open
      const activeSession = await this.posSessionService.findActiveSession(
        originalKot.outletId,
      );
      if (!activeSession) {
        throw new BadRequestException(
          'No active POS session found. Cannot transfer KOT.',
        );
      }

      // Step 4: Validate destination kitchen
      const destinationKitchen = await this.kitchenService.validateKitchen(
        transferDto.toKitchenId,
        originalKot.outletId,
      );

      if (destinationKitchen._id.toString() === originalKot.kitchenId.toString()) {
        throw new BadRequestException(
          'Cannot transfer to the same kitchen',
        );
      }

      // Step 5: Validate and prepare items to transfer
      const itemsToTransfer: typeof originalKot.items = [];
      const itemsToCancel: typeof originalKot.items = [];

      for (const transferItem of transferDto.items) {
        // Find matching item in original KOT by orderItemId
        const kotItem = originalKot.items.find(
          (item) => item.orderItemId.toString() === transferItem.orderItemId,
        );

        if (!kotItem) {
          throw new BadRequestException(
            `Order item ${transferItem.orderItemId} not found in KOT`,
          );
        }

        // Check if item is already cancelled or transferred
        if (kotItem.status === 'CANCELLED' || kotItem.status === 'TRANSFERRED') {
          throw new BadRequestException(
            `Item ${transferItem.orderItemId} is already ${kotItem.status.toLowerCase()}`,
          );
        }

        // Validate quantity
        if (transferItem.quantity > kotItem.quantity) {
          throw new BadRequestException(
            `Cannot transfer ${transferItem.quantity} of order item ${transferItem.orderItemId}. Only ${kotItem.quantity} available.`,
          );
        }

        // Add to cancellation list (source kitchen)
        itemsToCancel.push({
          ...this.toPlainKotItem(kotItem),
          quantity: transferItem.quantity,
          status: 'TRANSFERRED',
        });

        // Add to transfer list (destination kitchen)
        itemsToTransfer.push({
          ...this.toPlainKotItem(kotItem),
          quantity: transferItem.quantity,
          status: 'ACTIVE',
        });
      }

      // Step 6: Create CANCELLATION KOT in source kitchen
      const cancellationKot = new this.kotModel({
        orderId: originalKot.orderId,
        restaurantId: originalKot.restaurantId,
        outletId: originalKot.outletId,
        kitchenId: originalKot.kitchenId,
        kitchenName: originalKot.kitchenName,
        courseId: originalKot.courseId, // Copy course fields from original
        courseName: originalKot.courseName,
        courseSequence: originalKot.courseSequence,
        tableId: originalKot.tableId,
        kotNumber: originalKot.kotNumber, // Same kotNumber
        items: itemsToCancel,
        type: 'CANCELLATION',
        parentKotId: originalKot._id,
        actionReason: `Transfer to ${destinationKitchen.name}: ${transferDto.reason}`,
        status: 'PRINTED',
        printedAt: new Date(),
        printedBy: userId,
        cancelledAt: new Date(),
        cancelledByUserId: userId,
        notes: `Transferred to ${destinationKitchen.name}`,
      });

      const savedCancellationKot = await cancellationKot.save({ session });

      // Step 7: Generate new KOT number for destination kitchen
      const transferKotNumber = await this.generateKotNumber(
        originalKot.outletId,
        destinationKitchen._id,
        session,
      );

      // Step 8: Create NORMAL KOT in destination kitchen
      const transferKot = new this.kotModel({
        orderId: originalKot.orderId,
        restaurantId: originalKot.restaurantId,
        outletId: originalKot.outletId,
        kitchenId: destinationKitchen._id,
        kitchenName: destinationKitchen.name,
        courseId: originalKot.courseId, // Copy course fields from original (course doesn't change on transfer)
        courseName: originalKot.courseName,
        courseSequence: originalKot.courseSequence,
        tableId: originalKot.tableId,
        kotNumber: transferKotNumber, // New kotNumber for destination kitchen
        items: itemsToTransfer,
        type: 'NORMAL',
        parentKotId: originalKot._id,
        actionReason: `Transferred from ${originalKot.kitchenName}: ${transferDto.reason}`,
        status: 'PRINTED',
        printedAt: new Date(),
        printedBy: userId,
        notes: `Transferred from ${originalKot.kitchenName}`,
      });

      const savedTransferKot = await transferKot.save({ session });

      // Step 9: Update order items status (mark as transferred and update kitchen)
      const orderItemIds = itemsToTransfer.map((item) => item.orderItemId);
      await this.orderItemModel.updateMany(
        {
          _id: { $in: orderItemIds },
          orderId: originalKot.orderId,
        },
        {
          $set: {
            kitchenId: destinationKitchen._id,
            // Note: itemStatus remains PRINTED, but kitchen changed
          },
        },
        { session },
      );

      await session.commitTransaction();

      return {
        cancellationKot: this.toKotResponseDto(savedCancellationKot),
        transferKot: this.toKotResponseDto(savedTransferKot),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Fire a course (print pending KOTs for a specific course)
   * Petpooja-style: prints all PENDING KOTs for the specified course
   */
  async fireCourse(
    orderId: string,
    fireCourseDto: FireCourseDto,
    userId: string,
  ): Promise<{ kots: KotResponseDto[]; course: CourseResponseDto }> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Find order
      const order = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Step 2: Validate POS session is open
      const activeSession = await this.posSessionService.findActiveSession(
        order.outletId || '',
      );
      if (!activeSession) {
        throw new BadRequestException(
          'No active POS session found. Cannot fire course.',
        );
      }

      // Step 3: Find course by code
      const course = await this.coursesService.findByCodeAndOutlet(
        fireCourseDto.courseCode,
        order.outletId || '',
      );

      if (!course) {
        throw new NotFoundException(
          `Course with code ${fireCourseDto.courseCode} not found or inactive`,
        );
      }

      // Step 4: Find all PENDING KOTs for this order and course
      const pendingKots = await this.kotModel
        .find({
          orderId: new Types.ObjectId(orderId),
          courseId: course._id,
          status: 'PENDING',
        })
        .session(session)
        .exec();

      if (pendingKots.length === 0) {
        throw new BadRequestException(
          `No pending KOTs found for course ${fireCourseDto.courseCode} in this order`,
        );
      }

      // Step 5: Update KOTs to PRINTED status
      const kotIds = pendingKots.map((kot) => kot._id);
      await this.kotModel.updateMany(
        { _id: { $in: kotIds } },
        {
          $set: {
            status: 'PRINTED',
            printedAt: new Date(),
            printedBy: userId,
          },
        },
        { session },
      );

      // Step 6: Update order items status to PRINTED
      const orderItemIds = pendingKots.flatMap((kot) =>
        kot.items.map((item) => item.orderItemId),
      );

      await this.orderItemModel.updateMany(
        {
          _id: { $in: orderItemIds },
          orderId: new Types.ObjectId(orderId),
        },
        {
          $set: {
            itemStatus: 'PRINTED',
            printedAt: new Date(),
          },
        },
        { session },
      );

      await session.commitTransaction();

      // Step 7: Fetch updated KOTs for response
      const updatedKots = await this.kotModel
        .find({ _id: { $in: kotIds } })
        .exec();

      return {
        kots: updatedKots.map((kot) => this.toKotResponseDto(kot)),
        course: {
          _id: course._id.toString(),
          restaurantId: course.restaurantId,
          outletId: course.outletId,
          name: course.name,
          code: course.code,
          sequence: course.sequence,
          isDefault: course.isDefault,
          isActive: course.isActive,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Mark Order Item as Complimentary (Petpooja style)
   * Complimentary items have zero value, zero tax, but appear on bill
   */
  async markItemComplimentary(
    orderItemId: string,
    reason: string,
    userId: string, // TODO: Extract from JWT token
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Find order item
      const orderItem = await this.orderItemModel
        .findById(orderItemId)
        .session(session)
        .exec();

      if (!orderItem) {
        throw new NotFoundException(`Order item with ID ${orderItemId} not found`);
      }

      // Step 2: Find order
      const order = await this.orderModel
        .findById(orderItem.orderId)
        .session(session)
        .exec();

      if (!order) {
        throw new NotFoundException(`Order not found`);
      }

      // Step 3: Validate - cannot mark complimentary after bill is generated
      if (order.status === 'BILLED' || order.status === 'COMPLETED') {
        throw new BadRequestException(
          'Cannot mark item as complimentary after bill is generated',
        );
      }

      // Step 4: Update order item to be complimentary
      orderItem.isComplimentary = true;
      orderItem.complimentaryReason = reason;
      orderItem.price = 0;
      orderItem.totalPrice = 0;
      orderItem.taxableAmount = 0;
      orderItem.taxAmount = 0;
      orderItem.finalItemTotal = 0;

      await orderItem.save({ session });

      // Step 5: Recalculate order totals (excluding complimentary items)
      const allItems = await this.orderItemModel
        .find({ orderId: order._id })
        .session(session)
        .exec();

      const subtotal = allItems
        .filter((item) => !item.isComplimentary)
        .reduce((sum, item) => sum + item.totalPrice, 0);

      // Recalculate tax on non-complimentary items only
      const taxConfig = await this.taxConfigService.getTaxConfig(
        order.restaurantId,
      );
      const taxBreakdowns = this.taxConfigService.calculateTaxes(
        subtotal,
        taxConfig,
      );
      const totalTax = taxBreakdowns.reduce(
        (sum, tax) => sum + tax.amount,
        0,
      );

      // Update order totals
      order.subtotal = subtotal;
      order.tax = totalTax;
      order.total = subtotal + totalTax - order.discount;
      await order.save({ session });

      await session.commitTransaction();

      return {
        orderItemId: orderItem._id.toString(),
        isComplimentary: true,
        complimentaryReason: reason,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Void Bill (Petpooja style - bills are NEVER deleted, only voided)
   * Voided bills have no revenue, no GST, but remain in system for audit
   */
  async voidBill(
    orderId: string,
    reason: string,
    userId: string, // TODO: Extract from JWT token
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Find order
      const order = await this.orderModel
        .findById(orderId)
        .session(session)
        .exec();

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Step 2: Validate - bill must exist
      if (!order.billNumber) {
        throw new BadRequestException(
          'Cannot void order that has not been billed',
        );
      }

      // Step 3: Validate - bill must NOT already be voided
      if (order.isVoided) {
        throw new BadRequestException('Bill is already voided');
      }

      // Step 4: Validate - Z-Report must NOT be generated
      if (order.posSessionId) {
        const posSession = await this.posSessionService.findOne(
          order.posSessionId.toString(),
        );
        if (posSession?.zReportId) {
          throw new BadRequestException(
            'Cannot void bill. Z-Report has been generated for this session.',
          );
        }
      }

      // Step 5: Validate payments - must refund or mark invalid
      const existingPayments = await this.paymentModel
        .find({ orderId: order._id, status: 'COMPLETED' })
        .session(session)
        .exec();

      if (existingPayments.length > 0) {
        // Mark all payments as REFUNDED
        for (const payment of existingPayments) {
          payment.status = 'REFUNDED';
          payment.refundedAt = new Date();
          payment.refundReason = `Bill voided: ${reason}`;
          await payment.save({ session });
        }
      }

      // Step 6: Void the bill
      const originalBillAmount = order.netPayable || order.total;
      order.isVoided = true;
      order.voidedAt = new Date();
      order.voidedByUserId = userId;
      order.voidReason = reason;
      order.originalBillAmount = originalBillAmount;
      order.status = 'VOIDED';

      // Set all financials to zero (for voided bill)
      order.netPayable = 0;
      order.grossAmount = originalBillAmount; // Keep original for audit
      order.total = 0;
      order.tax = 0;

      await order.save({ session });

      // Step 7: Update POS session totals (if session exists)
      if (order.posSessionId) {
        // TODO: Recalculate session totals excluding voided bills
        // This should be handled in POS session service
      }

      await session.commitTransaction();

      return {
        orderId: order._id.toString(),
        billNumber: order.billNumber,
        voidedAt: order.voidedAt,
        voidedByUserId: userId,
        voidReason: reason,
        originalBillAmount,
        status: 'VOIDED',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Settle Credit Bill Later (Petpooja style)
   * Creates a new payment record to settle an existing credit payment
   */
  async settleCredit(
    paymentId: string,
    settleCreditDto: any, // SettleCreditDto
    userId: string, // TODO: Extract from JWT token
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Find original credit payment
      const originalPayment = await this.paymentModel
        .findById(paymentId)
        .session(session)
        .exec();

      if (!originalPayment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }

      // Step 2: Validate - must be a CREDIT payment
      if (originalPayment.paymentMethod !== 'CREDIT') {
        throw new BadRequestException(
          'Payment is not a credit payment. Only credit payments can be settled.',
        );
      }

      // Step 3: Validate - credit must not already be settled
      if (originalPayment.creditDetails?.isSettled) {
        throw new BadRequestException('Credit bill has already been settled');
      }

      // Step 4: Validate - settlement amount must match outstanding amount
      if (Math.abs(settleCreditDto.amount - originalPayment.amount) > 0.01) {
        throw new BadRequestException(
          `Settlement amount (${settleCreditDto.amount}) does not match outstanding credit amount (${originalPayment.amount})`,
        );
      }

      // Step 5: Find order
      const order = await this.orderModel
        .findById(originalPayment.orderId)
        .session(session)
        .exec();

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Step 6: Create settlement payment
      const settlementPayment = new this.paymentModel({
        orderId: order._id,
        restaurantId: order.restaurantId,
        posSessionId: order.posSessionId,
        paymentMethod: settleCreditDto.method,
        amount: settleCreditDto.amount,
        status: 'COMPLETED',
        transactionId: settleCreditDto.transactionId,
        referenceNumber: settleCreditDto.referenceNumber,
        notes: settleCreditDto.notes || `Settlement of credit payment ${paymentId}`,
        completedAt: new Date(),
        processedBy: userId,
      });

      const savedSettlementPayment = await settlementPayment.save({ session });

      // Step 7: Update original credit payment
      if (!originalPayment.creditDetails) {
        originalPayment.creditDetails = {
          customerName: order.customerPhone || 'Unknown',
          isSettled: false,
        };
      }

      originalPayment.creditDetails.isSettled = true;
      originalPayment.creditDetails.settledAt = new Date();
      originalPayment.creditDetails.originalPaymentId = originalPayment._id;
      originalPayment.creditDetails.settledPaymentId = savedSettlementPayment._id;

      await originalPayment.save({ session });

      // Step 8: Update POS session totals (if session exists)
      if (order.posSessionId) {
        // TODO: Update POS session to reflect credit settlement
        // This should update credit metrics in session
      }

      await session.commitTransaction();

      return {
        paymentId: originalPayment._id.toString(),
        originalCreditPaymentId: originalPayment._id.toString(),
        orderId: order._id.toString(),
        settlementPaymentId: savedSettlementPayment._id.toString(),
        amount: settleCreditDto.amount,
        method: settleCreditDto.method,
        settledAt: new Date(),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
