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
import { SuccessResponseDto } from './dto/success-response.dto';

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
}
