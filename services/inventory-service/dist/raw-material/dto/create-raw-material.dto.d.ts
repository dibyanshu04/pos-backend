import { RawMaterialCategory } from '../enums/raw-material-category.enum';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { PurchaseUnitEnum } from 'src/common/units/purchase-unit.enum';
declare class CostingDto {
    averageCost?: number;
    lastPurchaseCost?: number;
}
export declare class CreateRawMaterialDto {
    restaurantId: string;
    outletId: string;
    name: string;
    code: string;
    category: RawMaterialCategory;
    baseUnit: BaseUnitEnum;
    purchaseUnit: PurchaseUnitEnum;
    conversionFactor: number;
    isPerishable: boolean;
    shelfLifeInDays?: number;
    costing?: CostingDto;
    createdByUserId?: string;
    updatedByUserId?: string;
    isActive?: boolean;
}
export {};
