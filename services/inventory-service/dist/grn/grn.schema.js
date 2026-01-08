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
exports.GrnSchema = exports.Grn = exports.GrnItem = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_unit_enum_1 = require("../common/units/base-unit.enum");
const purchase_unit_enum_1 = require("../common/units/purchase-unit.enum");
class GrnItem {
}
exports.GrnItem = GrnItem;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RawMaterial', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], GrnItem.prototype, "rawMaterialId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], GrnItem.prototype, "rawMaterialName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0.0001 }),
    __metadata("design:type", Number)
], GrnItem.prototype, "purchaseQuantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: purchase_unit_enum_1.PurchaseUnitEnum, required: true }),
    __metadata("design:type", String)
], GrnItem.prototype, "purchaseUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0.0001 }),
    __metadata("design:type", Number)
], GrnItem.prototype, "baseQuantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: base_unit_enum_1.BaseUnitEnum, required: true }),
    __metadata("design:type", String)
], GrnItem.prototype, "baseUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0.0000001 }),
    __metadata("design:type", Number)
], GrnItem.prototype, "unitCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0.0001 }),
    __metadata("design:type", Number)
], GrnItem.prototype, "totalCost", void 0);
let Grn = class Grn {
};
exports.Grn = Grn;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], Grn.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], Grn.prototype, "outletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Vendor', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Grn.prototype, "vendorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Grn.prototype, "vendorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Grn.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Grn.prototype, "invoiceDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [GrnItem], required: true }),
    __metadata("design:type", Array)
], Grn.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0 }),
    __metadata("design:type", Number)
], Grn.prototype, "totalPurchaseCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Grn.prototype, "createdByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, immutable: true }),
    __metadata("design:type", Date)
], Grn.prototype, "createdAt", void 0);
exports.Grn = Grn = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false } })
], Grn);
exports.GrnSchema = mongoose_1.SchemaFactory.createForClass(Grn);
exports.GrnSchema.index({ outletId: 1, invoiceNumber: 1 }, { unique: false, sparse: true });
exports.GrnSchema.index({ outletId: 1, vendorId: 1, createdAt: -1 });
//# sourceMappingURL=grn.schema.js.map