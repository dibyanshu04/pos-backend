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
import { CategoriesService } from './categories.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: SuccessResponseDto,
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<SuccessResponseDto<any>> {
    const category = await this.categoriesService.create(createCategoryDto);
    return new SuccessResponseDto(category, 'Category created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for an outlet' })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const categories = await this.categoriesService.findAll(outletId);
    return new SuccessResponseDto(
      categories,
      'Categories retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: SuccessResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const category = await this.categoriesService.findOne(id);
    return new SuccessResponseDto(category, 'Category retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: SuccessResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<SuccessResponseDto<any>> {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return new SuccessResponseDto(category, 'Category updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoriesService.remove(id);
  }

  @Get('outlet/:outletId')
  @ApiOperation({ summary: 'Get active categories for an outlet' })
  @ApiParam({ name: 'outletId', description: 'Outlet ID' })
  @ApiResponse({
    status: 200,
    description: 'Active categories retrieved successfully',
    type: SuccessResponseDto,
  })
  async findByOutlet(
    @Param('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const categories = await this.categoriesService.findByOutlet(outletId);
    return new SuccessResponseDto(
      categories,
      'Active categories retrieved successfully',
    );
  }

  // @Put(':id/display-order/:order')
  // @ApiOperation({ summary: 'Update category display order' })
  // @ApiParam({ name: 'id', description: 'Category ID' })
  // @ApiParam({ name: 'order', description: 'Display order number' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Display order updated successfully',
  //   type: SuccessResponseDto,
  // })
  // async updateDisplayOrder(
  //   @Param('id') id: string,
  //   @Param('order') order: number,
  // ): Promise<SuccessResponseDto<any>> {
  //   const category = await this.categoriesService.updateDisplayOrder(id, order);
  //   return new SuccessResponseDto(
  //     category,
  //     'Display order updated successfully',
  //   );
  // }
}
