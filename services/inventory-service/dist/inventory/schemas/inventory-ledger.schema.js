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
exports.InventoryLedgerSchema = exports.InventoryLedger = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let InventoryLedger = class InventoryLedger {
};
exports.InventoryLedger = InventoryLedger;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "rawMaterialId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "rawMaterialName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "outletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['SALE_CONSUMPTION'],
    }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "transactionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InventoryLedger.prototype, "quantityChange", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "unit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['ORDER'] }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "referenceType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], InventoryLedger.prototype, "referenceId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], InventoryLedger.prototype, "remarks", void 0);
exports.InventoryLedger = InventoryLedger = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], InventoryLedger);
exports.InventoryLedgerSchema = mongoose_1.SchemaFactory.createForClass(InventoryLedger);
exports.InventoryLedgerSchema.index({
    referenceType: 1,
    referenceId: 1,
    transactionType: 1,
});
//# sourceMappingURL=inventory-ledger.schema.js.map