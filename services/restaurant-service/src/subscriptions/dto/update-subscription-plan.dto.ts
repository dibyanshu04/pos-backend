import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionPlanDto } from './create-subscription-plan.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateSubscriptionPlanDto extends PartialType(
  CreateSubscriptionPlanDto,
) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialPeriod?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;
}
