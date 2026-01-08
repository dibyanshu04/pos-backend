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
exports.LowStockAlertSchema = exports.LowStockAlert = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let LowStockAlert = class LowStockAlert {
};
exports.LowStockAlert = LowStockAlert;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], LowStockAlert.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], LowStockAlert.prototype, "outletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RawMaterial', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LowStockAlert.prototype, "rawMaterialId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], LowStockAlert.prototype, "rawMaterialName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], LowStockAlert.prototype, "threshold", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], LowStockAlert.prototype, "stockAtTrigger", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], LowStockAlert.prototype, "isResolved", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], LowStockAlert.prototype, "resolvedAt", void 0);
exports.LowStockAlert = LowStockAlert = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: 'triggeredAt', updatedAt: false } })
], LowStockAlert);
exports.LowStockAlertSchema = mongoose_1.SchemaFactory.createForClass(LowStockAlert);
exports.LowStockAlertSchema.index({ outletId: 1, rawMaterialId: 1, isResolved: 1 });
//# sourceMappingURL=low-stock-alert.schema.js.map