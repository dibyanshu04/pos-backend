import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface InventoryRecipeComponent {
  rawMaterialId: string;
  rawMaterialName: string;
  quantityPerUnit: number;
  unit: string;
}

export interface InventoryConsumptionItem {
  menuItemId: string;
  menuItemName: string;
  quantityOrdered: number;
  recipeSnapshot: InventoryRecipeComponent[];
}

export interface InventoryConsumptionPayload {
  orderId: string;
  restaurantId: string;
  outletId: string;
  items: InventoryConsumptionItem[];
}

export interface RawMaterialCostSnapshot {
  [rawMaterialId: string]: {
    averageCost: number;
  };
}

@Injectable()
export class InventoryServiceClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3005',
      timeout: 10_000,
    });
  }

  async consumeInventory(
    payload: InventoryConsumptionPayload,
  ): Promise<{ ledgerEntryIds?: string[] }> {
    try {
      const response = await this.client.post(
        '/internal/inventory/consume',
        payload,
        {
          headers: {
            'x-internal-token': process.env.INVENTORY_INTERNAL_TOKEN || '',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const message =
          error.response.data?.message || 'Inventory consumption failed';
        throw new BadRequestException(message);
      }
      throw new InternalServerErrorException(
        'Inventory service is unavailable. Please retry.',
      );
    }
  }

  async getRawMaterialCostSnapshot(
    rawMaterialIds: string[],
  ): Promise<RawMaterialCostSnapshot> {
    try {
      const response = await this.client.post(
        '/internal/raw-materials/cost-snapshot',
        { rawMaterialIds },
        {
          headers: {
            'x-internal-token': process.env.INVENTORY_INTERNAL_TOKEN || '',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const message =
          error.response.data?.message || 'Failed to fetch cost snapshot';
        throw new BadRequestException(message);
      }
      throw new InternalServerErrorException(
        'Inventory service is unavailable. Please retry.',
      );
    }
  }
}
