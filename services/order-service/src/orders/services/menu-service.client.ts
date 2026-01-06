import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export interface MenuItemPrice {
  menuItemId: string;
  itemName: string;
  variantId?: string;
  variantName?: string;
  price: number;
  isAvailable: boolean;
  taxIds?: string[]; // Tax IDs associated with this item
  kitchenId?: string; // Kitchen ID assigned to this item (from menu-service) - item-level
  categoryKitchenId?: string; // Kitchen ID assigned to item's category (from menu-service) - category-level
  categoryKitchenName?: string; // Kitchen name for category (optional, for better resolution)
  categoryCourseId?: string; // Course ID assigned to item's category (from menu-service) - category-level
}

export interface TaxDetail {
  _id: string;
  name: string;
  taxType: 'PERCENTAGE' | 'FIXED';
  value: number; // Percentage (0-100) or fixed amount
  inclusionType: 'INCLUSIVE' | 'EXCLUSIVE';
  scope: 'ITEM' | 'CATEGORY' | 'BILL';
  isActive: boolean;
  priority: number;
  taxCode?: string;
  taxTitle?: string;
  gstComponent?: 'CGST' | 'SGST';
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
   * @returns Promise<MenuItemPrice[]> - Array of validated items with current prices and taxIds
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
      taxIds: [`tax-${index + 1}`, `tax-${index + 2}`], // Mock taxIds - in production, fetch from item
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

  /**
   * Fetch tax details by tax IDs
   * @param restaurantId - Restaurant ID
   * @param taxIds - Array of tax IDs
   * @returns Promise<TaxDetail[]> - Array of tax details
   */
  async getTaxDetails(
    restaurantId: string,
    taxIds: string[],
  ): Promise<TaxDetail[]> {
    // TODO: Replace with actual HTTP call to menu-service
    // Example: POST /menu-service/taxes/bulk
    // Body: { restaurantId, taxIds: [...] }
    // Or: GET /menu-service/taxes?restaurantId=xxx&ids=id1,id2,id3
    console.log(`[MOCK] Fetching tax details for restaurant ${restaurantId}, taxIds: ${taxIds.join(', ')}`);
    
    // Mock: Return mock tax details (in production, fetch from menu-service)
    // In real implementation:
    // const response = await this.httpService.post('/taxes/bulk', {
    //   restaurantId,
    //   taxIds
    // });
    // return response.data;
    
    // Mock tax details - in production, fetch from menu-service taxes endpoint
    const mockTaxes: TaxDetail[] = taxIds.map((taxId, index) => ({
      _id: taxId,
      name: `Tax ${index + 1}`,
      taxType: 'PERCENTAGE' as const,
      value: 9 + index, // Mock: 9%, 10%, etc.
      inclusionType: 'EXCLUSIVE' as const,
      scope: 'ITEM' as const,
      isActive: true,
      priority: index,
      taxCode: index % 2 === 0 ? 'CGST' : 'SGST',
      taxTitle: index % 2 === 0 ? 'CGST' : 'SGST',
      gstComponent: index % 2 === 0 ? 'CGST' : 'SGST',
    }));

    return mockTaxes;
  }
}
