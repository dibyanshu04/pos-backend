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
import { VariantsService } from './variants.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@ApiTags('variants')
@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new variant' })
  @ApiBody({ type: CreateVariantDto })
  @ApiResponse({
    status: 201,
    description: 'Variant created successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  async create(
    @Body() createVariantDto: CreateVariantDto,
  ): Promise<SuccessResponseDto<any>> {
    const variant = await this.variantsService.create(createVariantDto);
    return new SuccessResponseDto(variant, 'Variant created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all variants for a restaurant' })
  @ApiQuery({ name: 'restaurantId', required: true, description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Variants retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const variants = await this.variantsService.findAll(restaurantId);
    return new SuccessResponseDto(
      variants,
      'Variants retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiParam({ name: 'id', description: 'Variant ID' })
  @ApiResponse({
    status: 200,
    description: 'Variant retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const variant = await this.variantsService.findOne(id);
    return new SuccessResponseDto(variant, 'Variant retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a variant' })
  @ApiParam({ name: 'id', description: 'Variant ID' })
  @ApiBody({ type: UpdateVariantDto })
  @ApiResponse({
    status: 200,
    description: 'Variant updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async update(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ): Promise<SuccessResponseDto<any>> {
    const variant = await this.variantsService.update(id, updateVariantDto);
    return new SuccessResponseDto(variant, 'Variant updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a variant' })
  @ApiParam({ name: 'id', description: 'Variant ID' })
  @ApiResponse({ status: 204, description: 'Variant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.variantsService.remove(id);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get active variants for a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Active variants retrieved successfully',
    type: SuccessResponseDto,
  })
  async findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const variants = await this.variantsService.findByRestaurant(restaurantId);
    return new SuccessResponseDto(
      variants,
      'Active variants retrieved successfully',
    );
  }
}

