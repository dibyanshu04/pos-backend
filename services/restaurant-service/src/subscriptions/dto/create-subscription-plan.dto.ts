import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SubscriptionFeaturesDto {
  @ApiProperty({ description: 'Maximum number of outlets', example: 3 })
  @IsNumber()
  @Min(1)
  maxOutlets: number;

  @ApiProperty({ description: 'Maximum number of users', example: 10 })
  @IsNumber()
  @Min(1)
  maxUsers: number;

  @ApiProperty({ description: 'Maximum number of menu items', example: 500 })
  @IsNumber()
  @Min(1)
  maxMenuItems: number;

  @ApiProperty({ description: 'Maximum orders per month', example: 5000 })
  @IsNumber()
  @Min(0)
  maxOrdersPerMonth: number;

  @ApiProperty({ description: 'Includes online ordering', example: true })
  @IsBoolean()
  hasOnlineOrdering: boolean;

  @ApiProperty({ description: 'Includes GST billing', example: true })
  @IsBoolean()
  hasGSTBilling: boolean;

  @ApiProperty({ description: 'Includes inventory management', example: true })
  @IsBoolean()
  hasInventoryManagement: boolean;

  @ApiProperty({ description: 'Includes reporting features', example: true })
  @IsBoolean()
  hasReporting: boolean;

  @ApiProperty({
    description: 'Multi-channel integration (Zomato/Swiggy)',
    example: false,
  })
  @IsBoolean()
  hasMultiChannel: boolean;

  @ApiProperty({
    description: 'Support type',
    enum: ['basic', 'priority', 'dedicated'],
    example: 'basic',
  })
  @IsEnum(['basic', 'priority', 'dedicated'])
  supportType: string;
}

export class CreateSubscriptionPlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Professional' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Perfect for growing restaurant chains with multiple outlets',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Monthly price', example: 2499 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Currency', example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Billing cycle',
    enum: ['monthly', 'quarterly', 'yearly'],
    example: 'monthly',
  })
  @IsEnum(['monthly', 'quarterly', 'yearly'])
  billingCycle: string;

  @ApiProperty({ description: 'Plan features' })
  @ValidateNested()
  @Type(() => SubscriptionFeaturesDto)
  features: SubscriptionFeaturesDto;

  @ApiProperty({ description: 'Is plan active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Trial period in days', example: 14, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialPeriod?: number;

  @ApiProperty({ description: 'One-time setup fee', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;

  @ApiProperty({
    description: 'Stripe price ID for payment integration',
    required: false,
  })
  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @ApiProperty({
    description: 'Razorpay plan ID for payment integration',
    required: false,
  })
  @IsOptional()
  @IsString()
  razorpayPlanId?: string;

  @ApiProperty({
    description: 'Plan benefits as bullet points',
    example: [
      'Unlimited orders',
      'GST compliant invoices',
      'Multi-outlet support',
      'Priority customer support',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
}
