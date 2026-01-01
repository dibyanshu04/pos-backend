import { Injectable } from '@nestjs/common';

export interface TaxConfig {
  cgstRate: number; // Central GST rate (percentage)
  sgstRate: number; // State GST rate (percentage)
  enabled: boolean;
}

/**
 * Mock Tax Configuration Service
 * In production, this would fetch tax configuration from a config service
 * or database based on restaurant/outlet settings
 */
@Injectable()
export class TaxConfigService {
  /**
   * Get tax configuration for a restaurant
   * @param restaurantId - Restaurant ID
   * @returns Tax configuration
   */
  async getTaxConfig(restaurantId: string): Promise<TaxConfig> {
    // TODO: Replace with actual configuration fetch
    // Example: GET /config-service/taxes/{restaurantId}
    // For now, return mock configuration
    
    // Mock: Standard GST rates (can be customized per restaurant)
    return {
      cgstRate: 9, // 9% CGST
      sgstRate: 9, // 9% SGST (total 18% GST)
      enabled: true,
    };
  }

  /**
   * Calculate taxes based on subtotal and configuration
   * @param subtotal - Subtotal amount
   * @param taxConfig - Tax configuration
   * @returns Array of tax breakdowns
   */
  calculateTaxes(
    subtotal: number,
    taxConfig: TaxConfig,
  ): Array<{ name: string; rate: number; amount: number; type: string }> {
    if (!taxConfig.enabled || subtotal <= 0) {
      return [];
    }

    const taxes : any = [];

    if (taxConfig.cgstRate > 0) {
      const cgstAmount = (subtotal * taxConfig.cgstRate) / 100;
      taxes.push({
        name: 'CGST',
        rate: taxConfig.cgstRate,
        amount: cgstAmount,
        type: 'CGST',
      });
    }

    if (taxConfig.sgstRate > 0) {
      const sgstAmount = (subtotal * taxConfig.sgstRate) / 100;
      taxes.push({
        name: 'SGST',
        rate: taxConfig.sgstRate,
        amount: sgstAmount,
        type: 'SGST',
      });
    }

    return taxes;
  }
}
