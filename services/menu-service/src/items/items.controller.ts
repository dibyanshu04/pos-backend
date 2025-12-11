import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { SuccessResponseDto } from '../common/dto/success-response.dto';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Item created successfully',
    type: SuccessResponseDto 
  })
  async create(@Body() createItemDto: CreateItemDto): Promise<SuccessResponseDto<any>> {
    const item = await this.itemsService.create(createItemDto);
    return new SuccessResponseDto(item, 'Item created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all items with optional filtering' })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Items retrieved successfully',
    type: SuccessResponseDto 
  })
  async findAll(
    @Query('outletId') outletId: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const items = await this.itemsService.findAll(outletId, categoryId);
    return new SuccessResponseDto(items, 'Items retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Item retrieved successfully',
    type: SuccessResponseDto 
  })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const item = await this.itemsService.findOne(id);
    return new SuccessResponseDto(item, 'Item retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Item updated successfully',
    type: SuccessResponseDto 
  })
  async update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<SuccessResponseDto<any>> {
    const item = await this.itemsService.update(id, updateItemDto);
    return new SuccessResponseDto(item, 'Item updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.itemsService.remove(id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get items by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Items retrieved by category',
    type: SuccessResponseDto 
  })
  async findByCategory(@Param('categoryId') categoryId: string): Promise<SuccessResponseDto<any[]>> {
    const items = await this.itemsService.findByCategory(categoryId);
    return new SuccessResponseDto(items, 'Items retrieved by category');
  }

  @Get('outlet/:outletId')
  @ApiOperation({ summary: 'Get active items for an outlet' })
  @ApiParam({ name: 'outletId', description: 'Outlet ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Active items retrieved successfully',
    type: SuccessResponseDto 
  })
  async findByOutlet(@Param('outletId') outletId: string): Promise<SuccessResponseDto<any[]>> {
    const items = await this.itemsService.findByOutlet(outletId);
    return new SuccessResponseDto(items, 'Active items retrieved successfully');
  }

  @Put(':id/availability/:isAvailable')
  @ApiOperation({ summary: 'Update item availability' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'isAvailable', description: 'true or false' })
  @ApiResponse({ 
    status: 200, 
    description: 'Availability updated successfully',
    type: SuccessResponseDto 
  })
  async updateAvailability(
    @Param('id') id: string,
    @Param('isAvailable') isAvailable: boolean,
  ): Promise<SuccessResponseDto<any>> {
    const item = await this.itemsService.updateAvailability(id, isAvailable === true);
    return new SuccessResponseDto(item, 'Availability updated successfully');
  }

  @Put(':id/channel-price/:channel')
  @ApiOperation({ summary: 'Update item price for specific channel' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiParam({ name: 'channel', description: 'Channel name (zomato or swiggy)' })
  @ApiBody({ schema: { type: 'object', properties: { price: { type: 'number' } } } })
  @ApiResponse({ 
    status: 200, 
    description: 'Channel price updated successfully',
    type: SuccessResponseDto 
  })
  async updateChannelPrice(
    @Param('id') id: string,
    @Param('channel') channel: 'zomato' | 'swiggy',
    @Body('price') price: number,
  ): Promise<SuccessResponseDto<any>> {
    const item = await this.itemsService.updateChannelPrice(id, channel, price);
    return new SuccessResponseDto(item, 'Channel price updated successfully');
  }
}