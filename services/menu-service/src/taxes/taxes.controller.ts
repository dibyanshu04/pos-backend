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
  ApiBody,
} from '@nestjs/swagger';
import { TaxesService } from './taxes.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { CreateTaxDto } from './dto/create-taxes.dto';
import { UpdateTaxDto } from './dto/update-taxes.dto';

@ApiTags('taxes')
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new tax',
    description: 'For GST Slab, automatically creates CGST and SGST pair. Returns array of taxes for GST Slab, single tax otherwise.',
  })
  @ApiBody({ type: CreateTaxDto })
  @ApiResponse({
    status: 201,
    description: 'Tax created successfully. Returns array for GST Slab (CGST/SGST), single tax otherwise.',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  async create(
    @Body() createTaxDto: CreateTaxDto,
  ): Promise<SuccessResponseDto<any>> {
    const tax = await this.taxesService.create(createTaxDto);
    const message = Array.isArray(tax) 
      ? 'GST Slab created successfully (CGST and SGST)' 
      : 'Tax created successfully';
    return new SuccessResponseDto(tax, message);
  }

  @Get()
  @ApiOperation({ summary: 'Get all taxes for a restaurant' })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  @ApiQuery({
    name: 'scope',
    required: false,
    enum: ['ITEM', 'CATEGORY', 'BILL'],
    description: 'Filter by tax scope',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'outletId',
    required: false,
    description: 'Filter by outlet ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Taxes retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('restaurantId') restaurantId: string,
    @Query('scope') scope?: string,
    @Query('isActive') isActive?: string,
    @Query('outletId') outletId?: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const taxes = await this.taxesService.findAll(
      restaurantId,
      scope,
      isActiveBool,
      outletId,
    );
    return new SuccessResponseDto(taxes, 'Taxes retrieved successfully');
  }

  @Get('item/:itemId')
  @ApiOperation({ summary: 'Get applicable taxes for a specific item' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  @ApiQuery({
    name: 'outletId',
    required: false,
    description: 'Outlet ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Applicable taxes retrieved successfully',
    type: SuccessResponseDto,
  })
  async findTaxesForItem(
    @Param('itemId') itemId: string,
    @Query('restaurantId') restaurantId: string,
    @Query('outletId') outletId?: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const taxes = await this.taxesService.findApplicableTaxesForItem(
      itemId,
      restaurantId,
      outletId,
    );
    return new SuccessResponseDto(
      taxes,
      'Applicable taxes retrieved successfully',
    );
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get applicable taxes for a specific category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  @ApiQuery({
    name: 'outletId',
    required: false,
    description: 'Outlet ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Applicable taxes retrieved successfully',
    type: SuccessResponseDto,
  })
  async findTaxesForCategory(
    @Param('categoryId') categoryId: string,
    @Query('restaurantId') restaurantId: string,
    @Query('outletId') outletId?: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const taxes = await this.taxesService.findApplicableTaxesForCategory(
      categoryId,
      restaurantId,
      outletId,
    );
    return new SuccessResponseDto(
      taxes,
      'Applicable taxes retrieved successfully',
    );
  }

  @Get('bill')
  @ApiOperation({ summary: 'Get bill-level taxes' })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  @ApiQuery({
    name: 'outletId',
    required: false,
    description: 'Outlet ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Bill-level taxes retrieved successfully',
    type: SuccessResponseDto,
  })
  async findBillTaxes(
    @Query('restaurantId') restaurantId: string,
    @Query('outletId') outletId?: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const taxes = await this.taxesService.findBillLevelTaxes(
      restaurantId,
      outletId,
    );
    return new SuccessResponseDto(
      taxes,
      'Bill-level taxes retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tax by ID' })
  @ApiParam({ name: 'id', description: 'Tax ID' })
  @ApiResponse({
    status: 200,
    description: 'Tax retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tax not found' })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const tax = await this.taxesService.findOne(id);
    return new SuccessResponseDto(tax, 'Tax retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tax' })
  @ApiParam({ name: 'id', description: 'Tax ID' })
  @ApiBody({ type: UpdateTaxDto })
  @ApiResponse({
    status: 200,
    description: 'Tax updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tax not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaxDto: UpdateTaxDto,
  ): Promise<SuccessResponseDto<any>> {
    const tax = await this.taxesService.update(id, updateTaxDto);
    return new SuccessResponseDto(tax, 'Tax updated successfully');
  }

  @Put('priority/bulk')
  @ApiOperation({ summary: 'Bulk update tax priorities' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              priority: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Priorities updated successfully',
    type: SuccessResponseDto,
  })
  async updatePriority(
    @Body() body: { updates: Array<{ id: string; priority: number }> },
  ): Promise<SuccessResponseDto<any>> {
    await this.taxesService.updatePriority(body.updates);
    return new SuccessResponseDto(null, 'Priorities updated successfully');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Toggle tax status (enable/disable)' })
  @ApiParam({ name: 'id', description: 'Tax ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tax status updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tax not found' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ): Promise<SuccessResponseDto<any>> {
    const tax = await this.taxesService.toggleStatus(id, body.isActive);
    return new SuccessResponseDto(tax, 'Tax status updated successfully');
  }

  @Get('selection/list')
  @ApiOperation({ 
    summary: 'Get taxes for item selection dropdown',
    description: 'Returns active item-level taxes formatted for selection in item creation form (Petpooja style)',
  })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  @ApiQuery({
    name: 'outletId',
    required: false,
    description: 'Outlet ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Taxes for selection retrieved successfully',
    type: SuccessResponseDto,
  })
  async getTaxesForSelection(
    @Query('restaurantId') restaurantId: string,
    @Query('outletId') outletId?: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const taxes = await this.taxesService.getTaxesForSelection(
      restaurantId,
      outletId,
    );
    return new SuccessResponseDto(
      taxes,
      'Taxes for selection retrieved successfully',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tax' })
  @ApiParam({ name: 'id', description: 'Tax ID' })
  @ApiResponse({ status: 204, description: 'Tax deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tax not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.taxesService.remove(id);
  }
}
