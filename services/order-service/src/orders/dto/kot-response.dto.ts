export class KotItemResponseDto {
  orderItemId: string;
  itemName: string;
  variantName?: string;
  quantity: number;
  specialInstructions?: string;
}

export class KotResponseDto {
  kotId: string;
  kotNumber: string;
  orderId: string;
  restaurantId: string;
  tableId?: string;
  items: KotItemResponseDto[];
  status: string;
  printedAt: Date;
  printedBy?: string;
  notes?: string;
}

export class CreateOrderWithKotResponseDto {
  orderId: string;
  kot: KotResponseDto;
}
