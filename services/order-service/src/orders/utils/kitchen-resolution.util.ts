/**
 * Kitchen Resolution Utility
 * 
 * Resolves kitchen for an item following priority order:
 * 1. Item-level kitchen (highest priority)
 * 2. Category-level kitchen
 * 3. Outlet default kitchen (fallback)
 * 
 * This resolution must be snapshotted into order/KOT and NEVER dynamically resolved later.
 */

export interface KitchenResolutionInput {
  itemKitchenId?: string | null;
  categoryKitchenId?: string | null;
  defaultKitchenId: string;
  defaultKitchenName: string;
}

export interface KitchenResolutionResult {
  kitchenId: string;
  kitchenName: string;
  resolutionSource: 'item' | 'category' | 'default';
}

/**
 * Resolve kitchen for an item based on priority
 * @param input - Kitchen resolution input parameters
 * @returns Resolved kitchen ID, name, and source
 */
export function resolveKitchenForItem(
  input: KitchenResolutionInput,
): KitchenResolutionResult {
  // Priority 1: Item-level kitchen (highest priority)
  if (input.itemKitchenId) {
    return {
      kitchenId: input.itemKitchenId,
      kitchenName: 'Item Kitchen', // Name should be fetched separately
      resolutionSource: 'item',
    };
  }

  // Priority 2: Category-level kitchen
  if (input.categoryKitchenId) {
    return {
      kitchenId: input.categoryKitchenId,
      kitchenName: 'Category Kitchen', // Name should be fetched separately
      resolutionSource: 'category',
    };
  }

  // Priority 3: Outlet default kitchen (fallback)
  return {
    kitchenId: input.defaultKitchenId,
    kitchenName: input.defaultKitchenName,
    resolutionSource: 'default',
  };
}

/**
 * Enhanced version that accepts kitchen names for better resolution
 */
export interface EnhancedKitchenResolutionInput {
  itemKitchenId?: string | null;
  itemKitchenName?: string | null;
  categoryKitchenId?: string | null;
  categoryKitchenName?: string | null;
  defaultKitchenId: string;
  defaultKitchenName: string;
}

export function resolveKitchenForItemEnhanced(
  input: EnhancedKitchenResolutionInput,
): KitchenResolutionResult {
  // Priority 1: Item-level kitchen (highest priority)
  if (input.itemKitchenId) {
    return {
      kitchenId: input.itemKitchenId,
      kitchenName: input.itemKitchenName || 'Item Kitchen',
      resolutionSource: 'item',
    };
  }

  // Priority 2: Category-level kitchen
  if (input.categoryKitchenId) {
    return {
      kitchenId: input.categoryKitchenId,
      kitchenName: input.categoryKitchenName || 'Category Kitchen',
      resolutionSource: 'category',
    };
  }

  // Priority 3: Outlet default kitchen (fallback)
  return {
    kitchenId: input.defaultKitchenId,
    kitchenName: input.defaultKitchenName,
    resolutionSource: 'default',
  };
}

