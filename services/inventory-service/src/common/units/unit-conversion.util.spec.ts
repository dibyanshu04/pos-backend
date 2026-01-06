import { BaseUnitEnum } from './base-unit.enum';
import { PurchaseUnitEnum } from './purchase-unit.enum';
import { convertToBaseUnit } from './unit-conversion.util';
import { validateUnitCompatibility } from './unit-validation.util';

describe('Unit Conversion Utilities', () => {
  describe('validateUnitCompatibility', () => {
    it('allows KG -> GM', () => {
      expect(
        validateUnitCompatibility(PurchaseUnitEnum.KG, BaseUnitEnum.GM),
      ).toBe(true);
    });

    it('allows LTR -> ML', () => {
      expect(
        validateUnitCompatibility(PurchaseUnitEnum.LTR, BaseUnitEnum.ML),
      ).toBe(true);
    });

    it('allows BOX -> PCS', () => {
      expect(
        validateUnitCompatibility(PurchaseUnitEnum.BOX, BaseUnitEnum.PCS),
      ).toBe(true);
    });

    it('rejects incompatible units (KG -> ML)', () => {
      expect(() =>
        validateUnitCompatibility(PurchaseUnitEnum.KG, BaseUnitEnum.ML),
      ).toThrow('Invalid unit combination');
    });

    it('rejects incompatible units (LTR -> GM)', () => {
      expect(() =>
        validateUnitCompatibility(PurchaseUnitEnum.LTR, BaseUnitEnum.GM),
      ).toThrow('Invalid unit combination');
    });
  });

  describe('convertToBaseUnit', () => {
    it('converts KG to GM using conversion factor', () => {
      const result = convertToBaseUnit(
        2,
        PurchaseUnitEnum.KG,
        BaseUnitEnum.GM,
        1000,
      );
      expect(result).toBe(2000);
    });

    it('converts LTR to ML with decimals', () => {
      const result = convertToBaseUnit(
        1.5,
        PurchaseUnitEnum.LTR,
        BaseUnitEnum.ML,
        1000,
      );
      expect(result).toBe(1500);
    });

    it('allows zero quantity (returns zero)', () => {
      const result = convertToBaseUnit(
        0,
        PurchaseUnitEnum.PCS,
        BaseUnitEnum.PCS,
        1,
      );
      expect(result).toBe(0);
    });

    it('allows negative quantity (e.g., returns/adjustments) and multiplies deterministically', () => {
      const result = convertToBaseUnit(
        -2,
        PurchaseUnitEnum.KG,
        BaseUnitEnum.GM,
        1000,
      );
      expect(result).toBe(-2000);
    });

    it('throws on invalid unit combination before converting', () => {
      expect(() =>
        convertToBaseUnit(1, PurchaseUnitEnum.LTR, BaseUnitEnum.GM, 1000),
      ).toThrow('Invalid unit combination');
    });
  });
});

