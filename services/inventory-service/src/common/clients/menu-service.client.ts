import { Injectable } from '@nestjs/common';

/**
 * Menu Service Client
 * Placeholder client to validate menu items and fetch snapshots.
 * In production, replace with HTTP calls to menu-service.
 */
@Injectable()
export class MenuServiceClient {
  /**
   * Validate menu item exists and belongs to the outlet; return snapshot.
   * TODO: Replace with actual HTTP integration.
   */
  async validateMenuItem(
    menuItemId: string,
    outletId: string,
  ): Promise<{ _id: string; name: string; outletId: string }> {
    // TODO: Implement real HTTP call to menu-service
    // Example response shape:
    // { _id, name, outletId }
    // For now, return a permissive mock to avoid blocking flows.
    return {
      _id: menuItemId,
      name: 'Menu Item',
      outletId,
    };
  }
}

