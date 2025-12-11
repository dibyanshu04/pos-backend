import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantSubscriptionDto } from './create-restaurant-subscription.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';

export class UpdateRestaurantSubscriptionDto extends PartialType(
  CreateRestaurantSubscriptionDto,
) {
  @ApiProperty({
    description: 'Subscription status',
    enum: ['active', 'pending', 'trial', 'canceled', 'expired'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'pending', 'trial', 'canceled', 'expired'])
  status?: string;

  @ApiProperty({ description: 'Auto-renew subscription', required: false })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiProperty({ description: 'Used orders this month', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usedOrdersThisMonth?: number;

  @ApiProperty({ description: 'Used menu items count', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usedMenuItems?: number;

  @ApiProperty({ description: 'Used outlets count', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usedOutlets?: number;

  @ApiProperty({ description: 'Custom end date', required: false })
  @IsOptional()
  endDate?: Date;
}
