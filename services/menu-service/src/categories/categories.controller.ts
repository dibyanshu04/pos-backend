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
  // TODO: Add RBAC guards when auth-service integration is complete
  // import { UseGuards } from '@nestjs/common';
  // import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  // import { RolesGuard } from '../auth/guards/roles.guard';
  // import { Roles } from '../common/decorators/roles.decorator';
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
// TODO: Add RBAC when auth-service integration is complete
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Creates a new category. Kitchen mapping requires OWNER or MANAGER role.',
  })
  // TODO: Add RBAC when auth-service integration is complete
  // @Roles('OWNER', 'MANAGER') // Only OWNER and MANAGER can map kitchen
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
  @ApiOperation({
    summary: 'Get all categories for an outlet',
    description:
      'Returns all categories for an outlet, including kitchen mapping information if available.',
  })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiQuery({ name: 'includeKitchen', required: false, type: Boolean, description: 'Include kitchen information' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully. Response includes kitchen information if category has kitchen mapping.',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('outletId') outletId: string,
    @Query('includeKitchen') includeKitchen?: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const shouldIncludeKitchen = includeKitchen === 'true';
    const categories = shouldIncludeKitchen
      ? await this.categoriesService.findAllWithKitchen(outletId)
      : await this.categoriesService.findAll(outletId);
    return new SuccessResponseDto(
      categories,
      'Categories retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description:
      'Returns a category by ID, including kitchen mapping information if available.',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiQuery({ name: 'includeKitchen', required: false, type: Boolean, description: 'Include kitchen information' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully. Response includes kitchen information if category has kitchen mapping.',
    type: SuccessResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @Query('includeKitchen') includeKitchen?: string,
  ): Promise<SuccessResponseDto<any>> {
    const shouldIncludeKitchen = includeKitchen === 'true';
    const category = shouldIncludeKitchen
      ? await this.categoriesService.findOneWithKitchen(id)
      : await this.categoriesService.findOne(id);
    return new SuccessResponseDto(category, 'Category retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a category',
    description:
      'Updates a category. Kitchen mapping requires OWNER or MANAGER role.',
  })
  // TODO: Add RBAC when auth-service integration is complete
  // @Roles('OWNER', 'MANAGER') // Only OWNER and MANAGER can map kitchen
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
  @ApiQuery({ name: 'includeKitchen', required: false, type: Boolean, description: 'Include kitchen information' })
  @ApiResponse({
    status: 200,
    description: 'Active categories retrieved successfully',
    type: SuccessResponseDto,
  })
  async findByOutlet(
    @Param('outletId') outletId: string,
    @Query('includeKitchen') includeKitchen?: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const shouldIncludeKitchen = includeKitchen === 'true';
    const categories = shouldIncludeKitchen
      ? await this.categoriesService.findAllWithKitchen(outletId)
      : await this.categoriesService.findByOutlet(outletId);
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
