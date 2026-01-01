import { Injectable } from '@nestjs/common';

export interface InventoryDeductionItem {
  menuItemId: string;
  variantId?: string;
  quantity: number;
}

/**
 * Mock InventoryService Client
 * In production, this would make HTTP calls to inventory-service
 * or use a service mesh/gRPC for inter-service communication
 */
@Injectable()
export class InventoryServiceClient {
  /**
   * Mock: Deduct stock based on items sold
   * @param restaurantId - Restaurant ID
   * @param items - Array of items with quantities to deduct
   * @returns Promise<void>
   */
  async deductStock(
    restaurantId: string,
    items: InventoryDeductionItem[],
  ): Promise<void> {
    // TODO: Replace with actual HTTP call to inventory-service
    // Example: POST /inventory-service/stock/deduct
    // Body: { restaurantId, items: [{ menuItemId, variantId, quantity }] }
    console.log(
      `[MOCK] Deducting stock for restaurant ${restaurantId}`,
      items,
    );

    // Mock: In production, make actual API call
    // await this.httpService.post('/stock/deduct', {
    //   restaurantId,
    //   items: items.map(item => ({
    //     menuItemId: item.menuItemId,
    //     variantId: item.variantId,
    //     quantity: item.quantity,
    //   }))
    // });

    return Promise.resolve();
  }
}
