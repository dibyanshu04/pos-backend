"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawMaterialSchema = exports.RawMaterial = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const raw_material_category_enum_1 = require("./enums/raw-material-category.enum");
const base_unit_enum_1 = require("../common/units/base-unit.enum");
const purchase_unit_enum_1 = require("../common/units/purchase-unit.enum");
let RawMaterial = class RawMaterial {
};
exports.RawMaterial = RawMaterial;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], RawMaterial.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], RawMaterial.prototype, "outletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], RawMaterial.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], RawMaterial.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: raw_material_category_enum_1.RawMaterialCategory, required: true }),
    __metadata("design:type", String)
], RawMaterial.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: base_unit_enum_1.BaseUnitEnum, required: true }),
    __metadata("design:type", String)
], RawMaterial.prototype, "baseUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: purchase_unit_enum_1.PurchaseUnitEnum, required: true }),
    __metadata("design:type", String)
], RawMaterial.prototype, "purchaseUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0.0001 }),
    __metadata("design:type", Number)
], RawMaterial.prototype, "conversionFactor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], RawMaterial.prototype, "isPerishable", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], RawMaterial.prototype, "shelfLifeInDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            averageCost: { type: Number, default: 0 },
            lastPurchaseCost: { type: Number, default: 0 },
        },
        default: { averageCost: 0, lastPurchaseCost: 0 },
    }),
    __metadata("design:type", Object)
], RawMaterial.prototype, "costing", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true, index: true }),
    __metadata("design:type", Boolean)
], RawMaterial.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], RawMaterial.prototype, "createdByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], RawMaterial.prototype, "updatedByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], RawMaterial.prototype, "lowStockThreshold", void 0);
exports.RawMaterial = RawMaterial = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RawMaterial);
exports.RawMaterialSchema = mongoose_1.SchemaFactory.createForClass(RawMaterial);
exports.RawMaterialSchema.index({ outletId: 1, code: 1 }, { unique: true });
exports.RawMaterialSchema.index({ outletId: 1, name: 1 }, { unique: true });
exports.RawMaterialSchema.index({ restaurantId: 1, outletId: 1, category: 1 });
exports.RawMaterialSchema.index({ outletId: 1, isActive: 1 });
//# sourceMappingURL=raw-material.schema.js.map