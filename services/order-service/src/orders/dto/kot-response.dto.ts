import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KotItemResponseDto {
  @ApiProperty({ description: 'Order Item ID' })
  orderItemId: string;

  @ApiProperty({ description: 'Item name' })
  itemName: string;

  @ApiPropertyOptional({ description: 'Variant name' })
  variantName?: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiPropertyOptional({ description: 'Special instructions' })
  specialInstructions?: string;
}

export class KotResponseDto {
  @ApiProperty({ description: 'KOT ID' })
  kotId: string;

  @ApiProperty({ description: 'KOT number (sequential per kitchen per day)' })
  kotNumber: string;

  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'Restaurant ID' })
  restaurantId: string;

  @ApiPropertyOptional({ description: 'Outlet ID' })
  outletId?: string;

  @ApiPropertyOptional({ description: 'Kitchen ID' })
  kitchenId?: string;

  @ApiPropertyOptional({ description: 'Kitchen name' })
  kitchenName?: string;

  @ApiPropertyOptional({ description: 'Table ID' })
  tableId?: string;

  @ApiProperty({ type: [KotItemResponseDto], description: 'KOT items' })
  items: KotItemResponseDto[];

  @ApiProperty({ enum: ['PRINTED', 'CANCELLED'], description: 'KOT status' })
  status: string;

  @ApiProperty({ description: 'Printed at timestamp' })
  printedAt: Date;

  @ApiPropertyOptional({ description: 'User ID who printed the KOT' })
  printedBy?: string;

  @ApiPropertyOptional({ description: 'KOT notes' })
  notes?: string;
}

export class CreateOrderWithKotResponseDto {
  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ type: KotResponseDto, description: 'First KOT (for backward compatibility)' })
  kot: KotResponseDto;

  @ApiPropertyOptional({ type: [KotResponseDto], description: 'All KOTs (one per kitchen)' })
  kots?: KotResponseDto[];
}

export class AddItemsToOrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ type: KotResponseDto, description: 'First delta KOT (for backward compatibility)' })
  kot: KotResponseDto;

  @ApiPropertyOptional({ type: [KotResponseDto], description: 'All delta KOTs (one per kitchen)' })
  kots?: KotResponseDto[];
}
