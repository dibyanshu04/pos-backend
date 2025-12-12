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
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { SuccessResponseDto } from '../common/dto/success-response.dto';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Create a new restaurant' })
  // @ApiBody({ type: CreateRestaurantDto })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Restaurant created successfully',
  //   type: SuccessResponseDto,
  // })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Restaurant with email or slug already exists',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Bad Request - Validation failed',
  // })
  // async create(
  //   @Body() createRestaurantDto: CreateRestaurantDto,
  // ): Promise<SuccessResponseDto<any>> {
  //   const restaurant =
  //     await this.restaurantsService.create(createRestaurantDto);
  //   return new SuccessResponseDto(
  //     restaurant,
  //     'Restaurant created successfully',
  //   )
  // }

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({
    status: 200,
    description: 'Restaurants retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(): Promise<SuccessResponseDto<any[]>> {
    const restaurants = await this.restaurantsService.findAll();
    return new SuccessResponseDto(
      restaurants,
      'Restaurants retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const restaurant = await this.restaurantsService.findOne(id);
    return new SuccessResponseDto(
      restaurant,
      'Restaurant retrieved successfully',
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get restaurant by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Restaurant slug (URL-friendly identifier)',
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<SuccessResponseDto<any>> {
    const restaurant = await this.restaurantsService.findBySlug(slug);
    return new SuccessResponseDto(
      restaurant,
      'Restaurant retrieved successfully',
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiResponse({
    status: 200,
    description: 'Restaurant updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<SuccessResponseDto<any>> {
    const restaurant = await this.restaurantsService.update(
      id,
      updateRestaurantDto,
    );
    return new SuccessResponseDto(
      restaurant,
      'Restaurant updated successfully',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 204, description: 'Restaurant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.restaurantsService.remove(id);
  }

  @Put(':id/status/:status')
  @ApiOperation({ summary: 'Update restaurant status' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiParam({
    name: 'status',
    description: 'New status (active, inactive, suspended, onboarding)',
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant status updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: string,
  ): Promise<SuccessResponseDto<any>> {
    const restaurant = await this.restaurantsService.updateStatus(id, status);
    return new SuccessResponseDto(
      restaurant,
      'Restaurant status updated successfully',
    );
  }

  @Put(':id/subscription/:subscriptionId')
  @ApiOperation({ summary: 'Assign subscription to restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiParam({ name: 'subscriptionId', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription assigned successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async assignSubscription(
    @Param('id') id: string,
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<SuccessResponseDto<any>> {
    const restaurant = await this.restaurantsService.assignSubscription(
      id,
      subscriptionId,
    );
    return new SuccessResponseDto(
      restaurant,
      'Subscription assigned successfully',
    );
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get restaurant statistics' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant stats retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getRestaurantStats(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const stats = await this.restaurantsService.getRestaurantStats(id);
    return new SuccessResponseDto(
      stats,
      'Restaurant stats retrieved successfully',
    );
  }

  @Get('search/filter')
  @ApiOperation({ summary: 'Search and filter restaurants' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({
    name: 'cuisine',
    required: false,
    description: 'Filter by cuisine',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurants filtered successfully',
    type: SuccessResponseDto,
  })
  async searchRestaurants(
    @Query('city') city?: string,
    @Query('cuisine') cuisine?: string,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<SuccessResponseDto<any>> {
    // This would call a search method in your service
    // For now, returning all with basic filtering
    const restaurants = await this.restaurantsService.findAll();

    let filteredRestaurants = restaurants;

    if (city) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) =>
        restaurant.location?.city?.toLowerCase().includes(city.toLowerCase()),
      );
    }

    if (status) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant.status === status,
      );
    }

    if (cuisine) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) =>
        restaurant.details?.cuisine?.includes(cuisine),
      );
    }

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRestaurants = filteredRestaurants.slice(
      startIndex,
      endIndex,
    );

    return new SuccessResponseDto(
      {
        restaurants: paginatedRestaurants,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: filteredRestaurants.length,
          totalPages: Math.ceil(filteredRestaurants.length / limit),
        },
      },
      'Restaurants filtered successfully',
    );
  }
}
