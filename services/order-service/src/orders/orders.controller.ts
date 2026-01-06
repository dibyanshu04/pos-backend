import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderWithKotDto } from './dto/create-order-with-kot.dto';
import { AddItemsToOrderDto } from './dto/add-items-to-order.dto';
import { GenerateBillDto } from './dto/generate-bill.dto';
import { SettleOrderDto } from './dto/settle-order.dto';
import { CreateDraftDto } from './dto/create-draft.dto';
import { SuccessResponseDto } from './dto/success-response.dto';
import { FireCourseDto } from '../courses/dto/fire-course.dto';
import { Request } from 'express';
import { VoidBillDto } from './dto/void-bill.dto';
import { MarkComplimentaryDto } from './dto/complimentary-item.dto';
import { SettleCreditDto } from './dto/settle-credit.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<SuccessResponseDto<any>> {
    const order = await this.ordersService.create(createOrderDto);
    return new SuccessResponseDto(order, 'Order created successfully');
  }

  @Post('draft')
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdateDraft(
    @Body() createDraftDto: CreateDraftDto,
  ): Promise<SuccessResponseDto<any>> {
    const order = await this.ordersService.createOrUpdateDraft(createDraftDto);
    return new SuccessResponseDto(
      order,
      createDraftDto.orderId
        ? 'Draft order updated successfully'
        : 'Draft order created successfully',
    );
  }

  @Post('create-with-kot')
  @HttpCode(HttpStatus.CREATED)
  async createOrderWithKOT(
    @Body() createOrderWithKotDto: CreateOrderWithKotDto,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.ordersService.createOrderWithKOT(
      createOrderWithKotDto,
    );
    return new SuccessResponseDto(
      result,
      'Order created and KOT generated successfully',
    );
  }

  @Post('add-items')
  @HttpCode(HttpStatus.OK)
  async addItemsToOrder(
    @Body() addItemsToOrderDto: AddItemsToOrderDto,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.ordersService.addItemsToOrder(
      addItemsToOrderDto,
    );
    return new SuccessResponseDto(
      result,
      'Items added to order and delta KOT generated successfully',
    );
  }

  @Post('generate-bill')
  @HttpCode(HttpStatus.OK)
  async generateBill(
    @Body() generateBillDto: GenerateBillDto,
  ): Promise<SuccessResponseDto<any>> {
    const bill = await this.ordersService.generateBill(generateBillDto);
    return new SuccessResponseDto(
      bill,
      bill.hasUnprintedItems
        ? 'Bill generated with warnings'
        : 'Bill generated successfully',
    );
  }

  @Post('settle')
  @HttpCode(HttpStatus.OK)
  async settleOrder(
    @Body() settleOrderDto: SettleOrderDto,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.ordersService.settleOrder(settleOrderDto);
    return new SuccessResponseDto(
      result,
      'Order settled successfully',
    );
  }

  @Post(':orderId/fire-course')
  @HttpCode(HttpStatus.OK)
  async fireCourse(
    @Param('orderId') orderId: string,
    @Body() fireCourseDto: FireCourseDto,
    @Request() req: any, // TODO: Replace with proper user decorator
  ): Promise<SuccessResponseDto<any>> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.userId || 'system'; // Temporary fallback

    const result = await this.ordersService.fireCourse(
      orderId,
      fireCourseDto,
      userId,
    );
    return new SuccessResponseDto(
      result,
      `Course ${fireCourseDto.courseCode} fired successfully`,
    );
  }

  @Get()
  async findAll(): Promise<SuccessResponseDto<any[]>> {
    const orders = await this.ordersService.findAll();
    return new SuccessResponseDto(orders, 'Orders retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const order = await this.ordersService.findOne(id);
    return new SuccessResponseDto(order, 'Order retrieved successfully');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<SuccessResponseDto<any>> {
    const order = await this.ordersService.update(id, updateOrderDto);
    return new SuccessResponseDto(order, 'Order updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.ordersService.delete(id);
    // NO_CONTENT returns empty body
  }

  @Get('status/:status')
  async findByStatus(
    @Param('status') status: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const orders = await this.ordersService.findByStatus(status);
    return new SuccessResponseDto(orders, 'Orders retrieved by status');
  }

  @Get('table/:tableNumber')
  async findByTable(
    @Param('tableNumber') tableNumber: number,
  ): Promise<SuccessResponseDto<any[]>> {
    const orders = await this.ordersService.findByTable(tableNumber);
    return new SuccessResponseDto(orders, 'Orders retrieved by table');
  }

  @Get('summary/overview')
  async getOrdersSummary(): Promise<SuccessResponseDto<any>> {
    const summary = await this.ordersService.getOrdersSummary();
    return new SuccessResponseDto(summary, 'Orders summary retrieved');
  }

  @Post(':orderId/void')
  @HttpCode(HttpStatus.OK)
  async voidBill(
    @Param('orderId') orderId: string,
    @Body() voidBillDto: VoidBillDto,
    @Request() req: any, // TODO: Replace with proper user decorator
  ): Promise<SuccessResponseDto<any>> {
    // TODO: Extract userId from JWT token when auth is implemented
    // TODO: Add RBAC guard (OWNER, MANAGER only)
    const userId = req.user?.userId || 'system'; // Temporary fallback

    const result = await this.ordersService.voidBill(
      orderId,
      voidBillDto.reason,
      userId,
    );
    return new SuccessResponseDto(result, 'Bill voided successfully');
  }

  @Post('items/:orderItemId/complimentary')
  @HttpCode(HttpStatus.OK)
  async markItemComplimentary(
    @Param('orderItemId') orderItemId: string,
    @Body() markComplimentaryDto: MarkComplimentaryDto,
    @Request() req: any, // TODO: Replace with proper user decorator
  ): Promise<SuccessResponseDto<any>> {
    // TODO: Extract userId from JWT token when auth is implemented
    // TODO: Add RBAC guard (OWNER, MANAGER, optionally CASHIER)
    const userId = req.user?.userId || 'system'; // Temporary fallback

    const result = await this.ordersService.markItemComplimentary(
      orderItemId,
      markComplimentaryDto.reason,
      userId,
    );
    return new SuccessResponseDto(
      result,
      'Item marked as complimentary successfully',
    );
  }
}
