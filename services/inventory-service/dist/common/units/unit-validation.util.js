"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUnitCompatibility = validateUnitCompatibility;
const base_unit_enum_1 = require("./base-unit.enum");
const purchase_unit_enum_1 = require("./purchase-unit.enum");
function validateUnitCompatibility(purchaseUnit, baseUnit) {
    const mapping = {
        [purchase_unit_enum_1.PurchaseUnitEnum.KG]: base_unit_enum_1.BaseUnitEnum.GM,
        [purchase_unit_enum_1.PurchaseUnitEnum.LTR]: base_unit_enum_1.BaseUnitEnum.ML,
        [purchase_unit_enum_1.PurchaseUnitEnum.BOX]: base_unit_enum_1.BaseUnitEnum.PCS,
        [purchase_unit_enum_1.PurchaseUnitEnum.PACK]: base_unit_enum_1.BaseUnitEnum.PCS,
        [purchase_unit_enum_1.PurchaseUnitEnum.PCS]: base_unit_enum_1.BaseUnitEnum.PCS,
    };
    const expectedBase = mapping[purchaseUnit];
    if (!expectedBase) {
        throw new Error(`Unsupported purchase unit: ${purchaseUnit}`);
    }
    if (expectedBase !== baseUnit) {
        throw new Error(`Invalid unit combination: ${purchaseUnit} must map to ${expectedBase} (received ${baseUnit})`);
    }
    return true;
}
//# sourceMappingURL=unit-validation.util.js.map