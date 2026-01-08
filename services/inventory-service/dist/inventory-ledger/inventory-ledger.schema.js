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
exports.InventoryLedgerSchema = exports.InventoryLedger = exports.InventoryReferenceType = exports.InventoryTransactionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_unit_enum_1 = require("../common/units/base-unit.enum");
var InventoryTransactionType;
(function (InventoryTransactionType) {
    InventoryTransactionType["PURCHASE"] = "PURCHASE";
    InventoryTransactionType["SALE_CONSUMPTION"] = "SALE_CONSUMPTION";
    InventoryTransactionType["WASTAGE"] = "WASTAGE";
    InventoryTransactionType["ADJUSTMENT"] = "ADJUSTMENT";
    InventoryTransactionType["OPENING_BALANCE"] = "OPENING_BALANCE";
})(InventoryTransactionType || (exports.InventoryTransactionType = InventoryTransactionType = {}));
var InventoryReferenceType;
(function (InventoryReferenceType) {
    InventoryReferenceType["ORDER"] = "ORDER";
    InventoryReferenceType["GRN"] = "GRN";
    InventoryReferenceType["WASTAGE"] = "WASTAGE";
    InventoryReferenceType["ADJUSTMENT"] = "ADJUSTMENT";
})(InventoryReferenceType || (exports.InventoryReferenceType = InventoryReferenceType = {}));
let InventoryLedger = class InventoryLedger {
};
exports.InventoryLedger = InventoryLedger;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "outletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RawMaterial', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InventoryLedger.prototype, "rawMaterialId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: InventoryTransactionType,
        required: true,
        index: true,
    }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "transactionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], InventoryLedger.prototype, "quantityChange", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: base_unit_enum_1.BaseUnitEnum, required: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "unit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: InventoryReferenceType, required: false }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "referenceType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InventoryLedger.prototype, "referenceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "remarks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "createdByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, immutable: true }),
    __metadata("design:type", Date)
], InventoryLedger.prototype, "createdAt", void 0);
exports.InventoryLedger = InventoryLedger = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false } })
], InventoryLedger);
exports.InventoryLedgerSchema = mongoose_1.SchemaFactory.createForClass(InventoryLedger);
exports.InventoryLedgerSchema.index({ outletId: 1, rawMaterialId: 1, createdAt: 1 });
exports.InventoryLedgerSchema.index({ outletId: 1, rawMaterialId: 1, transactionType: 1 });
exports.InventoryLedgerSchema.index({ rawMaterialId: 1, transactionType: 1 });
//# sourceMappingURL=inventory-ledger.schema.js.map