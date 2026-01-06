import { BaseUnitEnum } from './base-unit.enum';
import { PurchaseUnitEnum } from './purchase-unit.enum';

/**
 * Ensures purchase unit maps to the correct base unit.
 * Petpooja-style deterministic mapping:
 * KG  -> GM
 * LTR -> ML
 * BOX -> PCS
 * PACK-> PCS
 * PCS -> PCS
 */
export function validateUnitCompatibility(
  purchaseUnit: PurchaseUnitEnum,
  baseUnit: BaseUnitEnum,
): true {
  const mapping: Record<PurchaseUnitEnum, BaseUnitEnum> = {
    [PurchaseUnitEnum.KG]: BaseUnitEnum.GM,
    [PurchaseUnitEnum.LTR]: BaseUnitEnum.ML,
    [PurchaseUnitEnum.BOX]: BaseUnitEnum.PCS,
    [PurchaseUnitEnum.PACK]: BaseUnitEnum.PCS,
    [PurchaseUnitEnum.PCS]: BaseUnitEnum.PCS,
  };

  const expectedBase = mapping[purchaseUnit];
  if (!expectedBase) {
    throw new Error(`Unsupported purchase unit: ${purchaseUnit}`);
  }

  if (expectedBase !== baseUnit) {
    throw new Error(
      `Invalid unit combination: ${purchaseUnit} must map to ${expectedBase} (received ${baseUnit})`,
    );
  }

  return true;
}

