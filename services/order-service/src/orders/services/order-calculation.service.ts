import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface ItemDetails {
  _id: string;
  name: string;
  basePrice: number;
  variantIds?: string[];
  addonIds?: string[];
  taxIds?: string[];
  variantPricing?: Array<{
    variantId: string;
    variantValueName: string;
    priceOverride?: number;
  }>;
}

export interface VariantDetails {
  _id: string;
  name: string;
  values: Array<{
    name: string;
    price: number;
    basePrice?: number;
    isDefault?: boolean;
  }>;
}

export interface AddonDetails {
  _id: string;
  departmentName: string;
  items: Array<{
    name: string;
    price: number;
    applicableVariantIds?: string[];
    variantPricing?: Array<{
      variantId: string;
      variantValueName: string;
      priceModifier?: number;
    }>;
  }>;
  applicableVariantIds?: string[];
}

export interface TaxDetails {
  _id: string;
  name: string;
  value: number;
  taxType: 'PERCENTAGE' | 'FIXED';
  inclusionType: 'INCLUSIVE' | 'EXCLUSIVE';
  scope: 'ITEM' | 'CATEGORY' | 'BILL';
  priority: number;
  isActive: boolean;
}

export interface OrderItemCalculation {
  basePrice: number;
  variantPrice: number;
  addonPrice: number;
  subtotal: number;
  taxAmount: number;
  price: number;
  breakdown: {
    item: string;
    variants: Array<{ name: string; price: number }>;
    addons: Array<{ name: string; price: number }>;
    taxes: Array<{ name: string; amount: number }>;
  };
}

@Injectable()
export class OrderCalculationService {
  private menuServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.menuServiceUrl =
      this.configService.get<string>('MENU_SERVICE_URL') ||
      'http://localhost:3004';
  }

  /**
   * Calculate order totals with variants, addons, and taxes
   */
  async calculateOrder(
    items: Array<{
      menuItemId: string;
      quantity: number;
      variants?: Array<{ variantId: string; variantValueName: string }>;
      addons?: Array<{
        addonId: string;
        addonItemName: string;
        variants?: Array<{ variantId: string; variantValueName: string }>;
        quantity?: number;
      }>;
    }>,
    restaurantId?: string,
    outletId?: string,
  ): Promise<{
    items: OrderItemCalculation[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    breakdown: {
      itemSubtotal: number;
      variantTotal: number;
      addonTotal: number;
      taxTotal: number;
    };
  }> {
    const calculatedItems: OrderItemCalculation[] = [];
    let orderSubtotal = 0;
    let orderTaxAmount = 0;

    // Fetch all required data
    const itemIds = items.map((item) => item.menuItemId);
    const itemsData = await this.fetchItems(itemIds);
    const itemsMap = new Map(itemsData.map((item) => [item._id, item]));

    // Fetch variants and addons if needed
    const variantIds = new Set<string>();
    const addonIds = new Set<string>();
    itemsData.forEach((item) => {
      item.variantIds?.forEach((id) => variantIds.add(id));
      item.addonIds?.forEach((id) => addonIds.add(id));
    });

    const variantsMap = new Map<string, VariantDetails>();
    const addonsMap = new Map<string, AddonDetails>();

    if (variantIds.size > 0) {
      const variants = await this.fetchVariants(Array.from(variantIds));
      variants.forEach((v) => variantsMap.set(v._id, v));
    }

    if (addonIds.size > 0) {
      const addons = await this.fetchAddons(Array.from(addonIds));
      addons.forEach((a) => addonsMap.set(a._id, a));
    }

    // Fetch taxes
    const taxIds = new Set<string>();
    itemsData.forEach((item) => {
      item.taxIds?.forEach((id) => taxIds.add(id));
    });

    const taxesMap = new Map<string, TaxDetails>();
    if (taxIds.size > 0) {
      const taxes = await this.fetchTaxes(Array.from(taxIds), restaurantId, outletId);
      taxes.forEach((t) => taxesMap.set(t._id, t));
    }

    // Calculate each item
    for (const orderItem of items) {
      const itemDetails = itemsMap.get(orderItem.menuItemId);
      if (!itemDetails) {
        throw new HttpException(
          `Item ${orderItem.menuItemId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const calculation = this.calculateItem(
        itemDetails,
        orderItem,
        variantsMap,
        addonsMap,
        taxesMap,
      );

      calculatedItems.push(calculation);
      orderSubtotal += calculation.subtotal * orderItem.quantity;
      orderTaxAmount += calculation.taxAmount * orderItem.quantity;
    }

    const totalAmount = orderSubtotal + orderTaxAmount;

    return {
      items: calculatedItems,
      subtotal: orderSubtotal,
      taxAmount: orderTaxAmount,
      totalAmount,
      breakdown: {
        itemSubtotal: calculatedItems.reduce(
          (sum, item, index) => {
            const quantity = items[index]?.quantity || 1;
            return sum + item.basePrice * quantity;
          },
          0,
        ),
        variantTotal: calculatedItems.reduce(
          (sum, item, index) => {
            const quantity = items[index]?.quantity || 1;
            return sum + item.variantPrice * quantity;
          },
          0,
        ),
        addonTotal: calculatedItems.reduce(
          (sum, item, index) => {
            const quantity = items[index]?.quantity || 1;
            return sum + item.addonPrice * quantity;
          },
          0,
        ),
        taxTotal: orderTaxAmount,
      },
    };
  }

  /**
   * Calculate price for a single item with variants, addons, and taxes
   */
  private calculateItem(
    itemDetails: ItemDetails,
    orderItem: {
      menuItemId: string;
      quantity: number;
      variants?: Array<{ variantId: string; variantValueName: string }>;
      addons?: Array<{
        addonId: string;
        addonItemName: string;
        variants?: Array<{ variantId: string; variantValueName: string }>;
        quantity?: number;
      }>;
    },
    variantsMap: Map<string, VariantDetails>,
    addonsMap: Map<string, AddonDetails>,
    taxesMap: Map<string, TaxDetails>,
  ): OrderItemCalculation {
    let basePrice = itemDetails.basePrice;
    let variantPrice = 0;
    let addonPrice = 0;

    const variantBreakdown: Array<{ name: string; price: number }> = [];
    const addonBreakdown: Array<{ name: string; price: number }> = [];

    // Calculate variant prices
    if (orderItem.variants && orderItem.variants.length > 0) {
      for (const selectedVariant of orderItem.variants) {
        const variant = variantsMap.get(selectedVariant.variantId);
        if (!variant) continue;

        const variantValue = variant.values.find(
          (v) => v.name === selectedVariant.variantValueName,
        );
        if (!variantValue) continue;

        // Check for item-specific price override
        const priceOverride = itemDetails.variantPricing?.find(
          (vp) =>
            vp.variantId === selectedVariant.variantId &&
            vp.variantValueName === selectedVariant.variantValueName,
        )?.priceOverride;

        const variantPriceAdjustment = priceOverride !== undefined
          ? priceOverride
          : variantValue.price;

        variantPrice += variantPriceAdjustment;
        variantBreakdown.push({
          name: `${variant.name}: ${variantValue.name}`,
          price: variantPriceAdjustment,
        });
      }
    }

    // Calculate addon prices
    if (orderItem.addons && orderItem.addons.length > 0) {
      for (const selectedAddon of orderItem.addons) {
        const addon = addonsMap.get(selectedAddon.addonId);
        if (!addon) continue;

        const addonItem = addon.items.find(
          (item) => item.name === selectedAddon.addonItemName,
        );
        if (!addonItem) continue;

        let addonItemPrice = addonItem.price;

        // Apply variant pricing to addon item if variants are selected
        if (selectedAddon.variants && selectedAddon.variants.length > 0) {
          for (const addonVariant of selectedAddon.variants) {
            const variantModifier = addonItem.variantPricing?.find(
              (vp) =>
                vp.variantId === addonVariant.variantId &&
                vp.variantValueName === addonVariant.variantValueName,
            )?.priceModifier;

            if (variantModifier !== undefined) {
              addonItemPrice += variantModifier;
            }
          }
        }

        const quantity = selectedAddon.quantity || 1;
        const addonTotal = addonItemPrice * quantity;
        addonPrice += addonTotal;

        addonBreakdown.push({
          name: `${addon.departmentName}: ${addonItem.name}${quantity > 1 ? ` x${quantity}` : ''}`,
          price: addonTotal,
        });
      }
    }

    // Calculate subtotal
    const subtotal = basePrice + variantPrice + addonPrice;

    // Calculate taxes
    const applicableTaxes = this.getApplicableTaxes(
      itemDetails,
      taxesMap,
      subtotal,
    );
    const taxAmount = this.calculateTaxAmount(applicableTaxes, subtotal);

    const finalPrice = subtotal + taxAmount;

    return {
      basePrice,
      variantPrice,
      addonPrice,
      subtotal,
      taxAmount,
      price: finalPrice,
      breakdown: {
        item: `${itemDetails._id}|${itemDetails.name}`,
        variants: variantBreakdown,
        addons: addonBreakdown,
        taxes: applicableTaxes.map((tax) => ({
          name: tax.name,
          amount: this.calculateSingleTax(tax, subtotal),
        })),
      },
    };
  }

  /**
   * Get applicable taxes for an item
   */
  private getApplicableTaxes(
    itemDetails: ItemDetails,
    taxesMap: Map<string, TaxDetails>,
    subtotal: number,
  ): TaxDetails[] {
    const applicableTaxes: TaxDetails[] = [];

    if (!itemDetails.taxIds || itemDetails.taxIds.length === 0) {
      return applicableTaxes;
    }

    for (const taxId of itemDetails.taxIds) {
      const tax = taxesMap.get(taxId);
      if (tax && tax.isActive && tax.scope === 'ITEM') {
        applicableTaxes.push(tax);
      }
    }

    // Sort by priority
    return applicableTaxes.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate tax amount for a list of taxes
   */
  private calculateTaxAmount(taxes: TaxDetails[], subtotal: number): number {
    let totalTax = 0;
    let taxableAmount = subtotal;

    for (const tax of taxes) {
      const taxAmount = this.calculateSingleTax(tax, taxableAmount);
      totalTax += taxAmount;

      // For exclusive taxes, add to taxable amount for next tax calculation
      if (tax.inclusionType === 'EXCLUSIVE') {
        taxableAmount += taxAmount;
      }
    }

    return totalTax;
  }

  /**
   * Calculate single tax amount
   */
  private calculateSingleTax(tax: TaxDetails, amount: number): number {
    if (tax.taxType === 'FIXED') {
      return tax.value;
    }

    // Percentage tax
    return (amount * tax.value) / 100;
  }

  /**
   * Fetch items from menu-service
   */
  private async fetchItems(itemIds: string[]): Promise<ItemDetails[]> {
    try {
      const responses = await Promise.all(
        itemIds.map((id) =>
          firstValueFrom(
            this.httpService.get(`${this.menuServiceUrl}/items/${id}`),
          ),
        ),
      );
      return responses.map((res) => res.data.data);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch items from menu-service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Fetch variants from menu-service
   */
  private async fetchVariants(variantIds: string[]): Promise<VariantDetails[]> {
    try {
      const responses = await Promise.all(
        variantIds.map((id) =>
          firstValueFrom(
            this.httpService.get(`${this.menuServiceUrl}/variants/${id}`),
          ),
        ),
      );
      return responses.map((res) => {
        const variant = res.data?.data || res.data;
        return {
          _id: variant._id || variant.id,
          name: variant.name,
          values: variant.values || [],
        };
      });
    } catch (error) {
      throw new HttpException(
        `Failed to fetch variants from menu-service: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Fetch addons from menu-service
   */
  private async fetchAddons(addonIds: string[]): Promise<AddonDetails[]> {
    try {
      const responses = await Promise.all(
        addonIds.map((id) =>
          firstValueFrom(
            this.httpService.get(`${this.menuServiceUrl}/addons/${id}`),
          ),
        ),
      );
      return responses.map((res) => {
        const addon = res.data?.data || res.data;
        return {
          _id: addon._id || addon.id,
          departmentName: addon.departmentName,
          items: addon.items || [],
          applicableVariantIds: addon.applicableVariantIds || [],
        };
      });
    } catch (error) {
      throw new HttpException(
        `Failed to fetch addons from menu-service: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Fetch taxes from menu-service
   */
  private async fetchTaxes(
    taxIds: string[],
    restaurantId?: string,
    outletId?: string,
  ): Promise<TaxDetails[]> {
    try {
      // Use applicable taxes endpoint if available
      const params: any = { restaurantId: restaurantId || '' };
      if (outletId) params.outletId = outletId;

      const response = await firstValueFrom(
        this.httpService.get(`${this.menuServiceUrl}/taxes`, { params }),
      );

      const allTaxes = response.data?.data || response.data || [];
      return allTaxes
        .filter((tax: any) => taxIds.includes(tax._id || tax.id))
        .map((tax: any) => ({
          _id: tax._id || tax.id,
          name: tax.name,
          value: tax.value,
          taxType: tax.taxType,
          inclusionType: tax.inclusionType,
          scope: tax.scope,
          priority: tax.priority,
          isActive: tax.isActive,
        }));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch taxes from menu-service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

