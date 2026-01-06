import { BaseUnitEnum } from './base-unit.enum';
import { PurchaseUnitEnum } from './purchase-unit.enum';
import { validateUnitCompatibility } from './unit-validation.util';

/**
 * Convert purchase quantity into base-unit quantity.
 * No rounding is performed here; callers handle rounding if needed.
 */
export function convertToBaseUnit(
  quantity: number,
  purchaseUnit: PurchaseUnitEnum,
  baseUnit: BaseUnitEnum,
  conversionFactor: number,
): number {
  validateUnitCompatibility(purchaseUnit, baseUnit);

  return quantity * conversionFactor;
}

