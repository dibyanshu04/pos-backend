import { Injectable } from '@nestjs/common';

/**
 * Restaurant Service Client
 * In production, this would make HTTP calls to restaurant-service
 * For now, this is a placeholder that can be replaced with actual HTTP calls
 */
@Injectable()
export class RestaurantServiceClient {
  /**
   * Get outlet billing configuration
   * @param outletId - Outlet ID
   * @returns Promise with outlet billing config
   */
  async getOutletBillingConfig(outletId: string): Promise<{
    roundOff: {
      enabled: boolean;
      method: 'NEAREST' | 'UP' | 'DOWN';
      precision: 0.05 | 0.1 | 1.0;
    };
  } | null> {
    // TODO: Replace with actual HTTP call to restaurant-service
    // Example: GET /restaurant-service/outlets/:outletId
    // Return outlet.billingConfig
    
    // For now, return default config (Petpooja-style)
    // In production, this would be:
    // const response = await this.httpService.get(`/outlets/${outletId}`);
    // return response.data.billingConfig || this.getDefaultBillingConfig();
    
    console.log(`[MOCK] Fetching billing config for outlet ${outletId}`);
    return this.getDefaultBillingConfig();
  }

  /**
   * Get default billing configuration (Petpooja-style)
   */
  private getDefaultBillingConfig(): {
    roundOff: {
      enabled: boolean;
      method: 'NEAREST' | 'UP' | 'DOWN';
      precision: 0.05 | 0.1 | 1.0;
    };
  } {
    return {
      roundOff: {
        enabled: true,
        method: 'NEAREST',
        precision: 0.05,
      },
    };
  }
}


