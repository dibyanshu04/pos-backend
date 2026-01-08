import { BaseUnitEnum } from './base-unit.enum';
import { PurchaseUnitEnum } from './purchase-unit.enum';
export declare function convertToBaseUnit(quantity: number, purchaseUnit: PurchaseUnitEnum, baseUnit: BaseUnitEnum, conversionFactor: number): number;
