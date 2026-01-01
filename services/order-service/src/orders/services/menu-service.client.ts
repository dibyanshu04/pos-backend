import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export interface MenuItemPrice {
  menuItemId: string;
  itemName: string;
  variantId?: string;
  variantName?: string;
  price: number;
  isAvailable: boolean;
}

/**
 * Mock MenuService Client
 * In production, this would make HTTP calls to menu-service
 * or use a service mesh/gRPC for inter-service communication
 */
@Injectable()
export class MenuServiceClient {
  /**
   * Mock: Validate item IDs and fetch current prices
   * @param restaurantId - Restaurant ID
   * @param items - Array of items with menuItemId and optional variantId
   * @returns Promise<MenuItemPrice[]> - Array of validated items with current prices
   */
  async validateItemsAndGetPrices(
    restaurantId: string,
    items: Array<{ menuItemId: string; variantId?: string }>,
  ): Promise<MenuItemPrice[]> {
    // TODO: Replace with actual HTTP call to menu-service
    // Example: POST /menu-service/items/validate-and-get-prices
    // Body: { restaurantId, items: [{ menuItemId, variantId }] }
    console.log(`[MOCK] Validating items and fetching prices for restaurant ${restaurantId}`);
    
    // Mock: Return mock prices (in production, fetch from menu-service)
    // In real implementation:
    // const response = await this.httpService.post('/items/validate-and-get-prices', {
    //   restaurantId,
    //   items: items.map(item => ({ menuItemId: item.menuItemId, variantId: item.variantId }))
    // });
    // return response.data;
    
    const validatedItems: MenuItemPrice[] = items.map((item, index) => ({
      menuItemId: item.menuItemId,
      itemName: `Item ${item.menuItemId}`, // Mock name
      variantId: item.variantId,
      variantName: item.variantId ? `Variant ${item.variantId}` : undefined,
      price: 100 + index * 10, // Mock price
      isAvailable: true,
    }));

    // Validate all items are available
    const unavailableItems = validatedItems.filter(item => !item.isAvailable);
    if (unavailableItems.length > 0) {
      throw new BadRequestException(
        `Items not available: ${unavailableItems.map(i => i.menuItemId).join(', ')}`,
      );
    }

    return validatedItems;
  }
}
