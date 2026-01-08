"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToBaseUnit = convertToBaseUnit;
const unit_validation_util_1 = require("./unit-validation.util");
function convertToBaseUnit(quantity, purchaseUnit, baseUnit, conversionFactor) {
    (0, unit_validation_util_1.validateUnitCompatibility)(purchaseUnit, baseUnit);
    return quantity * conversionFactor;
}
//# sourceMappingURL=unit-conversion.util.js.map