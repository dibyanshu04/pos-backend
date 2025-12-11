import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  billingCycle: string;

  @ApiProperty()
  features: any;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  trialPeriod: number;

  @ApiProperty()
  setupFee: number;

  @ApiProperty()
  benefits: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RestaurantSubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  restaurantId: string;

  @ApiProperty()
  planId: string;

  @ApiProperty()
  plan: SubscriptionPlanResponseDto;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  autoRenew: boolean;

  @ApiProperty()
  usedOrdersThisMonth: number;

  @ApiProperty()
  usedMenuItems: number;

  @ApiProperty()
  usedOutlets: number;

  @ApiProperty()
  payment: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UsageLimitsResponseDto {
  @ApiProperty()
  subscription: {
    id: string;
    status: string;
    plan: string;
  };

  @ApiProperty()
  usage: {
    orders: {
      used: number;
      limit: number;
      remaining: number;
      exceeded: boolean;
    };
    menuItems: {
      used: number;
      limit: number;
      remaining: number;
      exceeded: boolean;
    };
    outlets: {
      used: number;
      limit: number;
      remaining: number;
      exceeded: boolean;
    };
  };

  @ApiProperty()
  isWithinLimits: boolean;
}

export class SubscriptionAnalyticsResponseDto {
  @ApiProperty()
  totalSubscriptions: number;

  @ApiProperty()
  activeSubscriptions: number;

  @ApiProperty()
  trialSubscriptions: number;

  @ApiProperty()
  monthlyRevenue: number;

  @ApiProperty()
  churnRate: number;

  @ApiProperty()
  mostPopularPlan: string;

  @ApiProperty()
  averageRevenuePerUser: number;
}
