import { IsString, IsNumber, IsOptional, IsNotEmpty, Min } from 'class-validator';

export class GenerateBillDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number; // Optional discount amount to apply

  @IsString()
  @IsOptional()
  discountReason?: string; // Optional reason for discount
}

export class BillItemDto {
  orderItemId: string;
  menuItemId: string;
  itemName: string;
  variantName?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  specialInstructions?: string;
}

export class BillTaxDto {
  name: string;
  rate: number;
  amount: number;
  type: 'CGST' | 'SGST' | 'IGST' | 'OTHER';
}

export class BillResponseDto {
  billId: string;
  billNumber: string;
  orderId: string;
  restaurantId: string;
  tableId?: string;
  waiterId?: string;
  customerPhone?: string;
  items: BillItemDto[];
  subtotal: number;
  taxes: BillTaxDto[];
  totalTax: number;
  discount: number;
  discountReason?: string;
  grandTotal: number;
  orderType: string;
  status: string;
  billedAt: Date;
  hasUnprintedItems: boolean;
  unprintedItemsWarning?: string;
}
