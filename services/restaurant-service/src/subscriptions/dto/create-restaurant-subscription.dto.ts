import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class PaymentDetailsDto {
  @ApiProperty({
    description: 'Payment amount',
    example: 2499,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ description: 'Currency', example: 'INR', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Payment method',
    example: 'stripe',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ description: 'Transaction ID', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ description: 'Payment date', required: false })
  @IsOptional()
  paidAt?: Date;
}

export class CreateRestaurantSubscriptionDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsString()
  restaurantId: string;

  @ApiProperty({ description: 'Subscription plan ID' })
  @IsString()
  planId: string;

  @ApiProperty({
    description: 'Subscription status',
    enum: ['active', 'pending', 'trial', 'canceled'],
    default: 'pending',
  })
  @IsOptional()
  @IsEnum(['active', 'pending', 'trial', 'canceled'])
  status?: string;

  @ApiProperty({
    description: 'Auto-renew subscription',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiProperty({
    description: 'Stripe subscription ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @ApiProperty({
    description: 'Razorpay subscription ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  razorpaySubscriptionId?: string;

  @ApiProperty({
    description: 'Payment details',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  payment?: PaymentDetailsDto;

  @ApiProperty({
    description: 'Custom start date (if different from current date)',
    required: false,
  })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'Custom end date (if different from calculated date)',
    required: false,
  })
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Promo code applied',
    required: false,
  })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({
    description: 'Discount amount applied',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;
}
