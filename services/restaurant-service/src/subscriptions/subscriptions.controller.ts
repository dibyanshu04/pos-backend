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
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { CreateRestaurantSubscriptionDto } from './dto/create-restaurant-subscription.dto';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // Plan Management Endpoints
  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiBody({ type: CreateSubscriptionPlanDto })
  @ApiResponse({
    status: 201,
    description: 'Subscription plan created successfully',
    type: SuccessResponseDto,
  })
  async createPlan(
    @Body() createPlanDto: CreateSubscriptionPlanDto,
  ): Promise<SuccessResponseDto<any>> {
    const plan = await this.subscriptionsService.createPlan(createPlanDto);
    return new SuccessResponseDto(
      plan,
      'Subscription plan created successfully',
    );
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all active subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plans retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAllPlans(): Promise<SuccessResponseDto<any[]>> {
    const plans = await this.subscriptionsService.findAllPlans();
    return new SuccessResponseDto(
      plans,
      'Subscription plans retrieved successfully',
    );
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan retrieved successfully',
    type: SuccessResponseDto,
  })
  async findPlanById(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const plan = await this.subscriptionsService.findPlanById(id);
    return new SuccessResponseDto(
      plan,
      'Subscription plan retrieved successfully',
    );
  }

  // Restaurant Subscription Endpoints
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a restaurant subscription' })
  @ApiBody({ type: CreateRestaurantSubscriptionDto })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: SuccessResponseDto,
  })
  async createSubscription(
    @Body() createSubscriptionDto: CreateRestaurantSubscriptionDto,
  ): Promise<SuccessResponseDto<any>> {
    const subscription = await this.subscriptionsService.createSubscription(
      createSubscriptionDto,
    );
    return new SuccessResponseDto(
      subscription,
      'Subscription created successfully',
    );
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get restaurant subscription' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
    type: SuccessResponseDto,
  })
  async getRestaurantSubscription(
    @Param('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any>> {
    const subscription =
      await this.subscriptionsService.getRestaurantSubscription(restaurantId);
    return new SuccessResponseDto(
      subscription,
      'Subscription retrieved successfully',
    );
  }

  @Put(':id/status/:status')
  @ApiOperation({ summary: 'Update subscription status' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiParam({ name: 'status', description: 'New status' })
  @ApiResponse({
    status: 200,
    description: 'Subscription status updated successfully',
    type: SuccessResponseDto,
  })
  async updateSubscriptionStatus(
    @Param('id') id: string,
    @Param('status') status: string,
  ): Promise<SuccessResponseDto<any>> {
    const subscription =
      await this.subscriptionsService.updateSubscriptionStatus(id, status);
    return new SuccessResponseDto(
      subscription,
      'Subscription status updated successfully',
    );
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
    type: SuccessResponseDto,
  })
  async cancelSubscription(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const subscription = await this.subscriptionsService.cancelSubscription(id);
    return new SuccessResponseDto(
      subscription,
      'Subscription canceled successfully',
    );
  }

  @Put(':id/renew')
  @ApiOperation({ summary: 'Renew subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription renewed successfully',
    type: SuccessResponseDto,
  })
  async renewSubscription(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const subscription = await this.subscriptionsService.renewSubscription(id);
    return new SuccessResponseDto(
      subscription,
      'Subscription renewed successfully',
    );
  }

  @Get('restaurant/:restaurantId/usage')
  @ApiOperation({ summary: 'Check subscription usage limits' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Usage limits retrieved successfully',
    type: SuccessResponseDto,
  })
  async checkUsageLimits(
    @Param('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any>> {
    const usage =
      await this.subscriptionsService.checkUsageLimits(restaurantId);
    return new SuccessResponseDto(usage, 'Usage limits retrieved successfully');
  }

  @Post('restaurant/:restaurantId/usage/:type')
  @ApiOperation({ summary: 'Increment usage counter' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiParam({
    name: 'type',
    description: 'Usage type (orders, menuItems, outlets)',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    description: 'Count to increment',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Usage incremented successfully',
    type: SuccessResponseDto,
  })
  async incrementUsage(
    @Param('restaurantId') restaurantId: string,
    @Param('type') type: 'orders' | 'menuItems' | 'outlets',
    @Query('count') count: number = 1,
  ): Promise<SuccessResponseDto<any>> {
    await this.subscriptionsService.incrementUsage(restaurantId, type, count);
    return new SuccessResponseDto(null, 'Usage incremented successfully');
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get subscription analytics' })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    type: SuccessResponseDto,
  })
  async getAnalytics(): Promise<SuccessResponseDto<any>> {
    const analytics =
      await this.subscriptionsService.getSubscriptionAnalytics();
    return new SuccessResponseDto(
      analytics,
      'Analytics retrieved successfully',
    );
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring subscriptions' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Days to check for expiration',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Expiring subscriptions retrieved successfully',
    type: SuccessResponseDto,
  })
  async getExpiringSubscriptions(
    @Query('days') days: number = 7,
  ): Promise<SuccessResponseDto<any[]>> {
    const subscriptions =
      await this.subscriptionsService.getExpiringSubscriptions(days);
    return new SuccessResponseDto(
      subscriptions,
      'Expiring subscriptions retrieved successfully',
    );
  }
}
