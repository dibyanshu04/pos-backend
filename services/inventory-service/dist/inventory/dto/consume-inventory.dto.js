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
exports.ConsumeInventoryDto = exports.ConsumeItemDto = exports.RecipeComponentDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RecipeComponentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { rawMaterialId: { required: true, type: () => String }, rawMaterialName: { required: true, type: () => String }, quantityPerUnit: { required: true, type: () => Number, minimum: 1 }, unit: { required: true, type: () => String } };
    }
}
exports.RecipeComponentDto = RecipeComponentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecipeComponentDto.prototype, "rawMaterialId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecipeComponentDto.prototype, "rawMaterialName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RecipeComponentDto.prototype, "quantityPerUnit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecipeComponentDto.prototype, "unit", void 0);
class ConsumeItemDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { menuItemId: { required: true, type: () => String }, menuItemName: { required: true, type: () => String }, quantityOrdered: { required: true, type: () => Number, minimum: 1 }, recipeSnapshot: { required: true, type: () => [require("./consume-inventory.dto").RecipeComponentDto], minItems: 1 } };
    }
}
exports.ConsumeItemDto = ConsumeItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConsumeItemDto.prototype, "menuItemId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConsumeItemDto.prototype, "menuItemName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ConsumeItemDto.prototype, "quantityOrdered", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecipeComponentDto),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], ConsumeItemDto.prototype, "recipeSnapshot", void 0);
class ConsumeInventoryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { orderId: { required: true, type: () => String }, restaurantId: { required: true, type: () => String }, outletId: { required: true, type: () => String }, items: { required: true, type: () => [require("./consume-inventory.dto").ConsumeItemDto], minItems: 1 } };
    }
}
exports.ConsumeInventoryDto = ConsumeInventoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConsumeInventoryDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConsumeInventoryDto.prototype, "restaurantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConsumeInventoryDto.prototype, "outletId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConsumeItemDto),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], ConsumeInventoryDto.prototype, "items", void 0);
//# sourceMappingURL=consume-inventory.dto.js.map