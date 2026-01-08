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
exports.CreateRecipeDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RecipeComponentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { rawMaterialId: { required: true, type: () => String }, quantityPerUnit: { required: true, type: () => Number, minimum: 0.0001 } };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Raw material ID (must be active and outlet-scoped)',
        example: '64f0c9a2b7d3c2f1a1234567',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecipeComponentDto.prototype, "rawMaterialId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity consumed per 1 unit of menu item (BASE UNIT ONLY). Must be > 0.',
        example: 120,
        minimum: 0.0001,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], RecipeComponentDto.prototype, "quantityPerUnit", void 0);
class CreateRecipeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { restaurantId: { required: true, type: () => String }, outletId: { required: true, type: () => String }, menuItemId: { required: true, type: () => String }, createdByUserId: { required: false, type: () => String }, components: { required: true, type: () => [RecipeComponentDto], minItems: 1 } };
    }
}
exports.CreateRecipeDto = CreateRecipeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Restaurant ID (tenant scope)',
        example: 'restaurant-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRecipeDto.prototype, "restaurantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Outlet ID (recipe is outlet-scoped)',
        example: 'outlet-789',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRecipeDto.prototype, "outletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item ID from menu-service',
        example: 'menu-item-456',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRecipeDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Audit user creating the recipe',
        example: 'user-1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecipeDto.prototype, "createdByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [RecipeComponentDto],
        description: 'List of raw materials consumed per 1 unit of menu item. All quantities are in BASE UNIT (GM/ML/PCS).',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecipeComponentDto),
    __metadata("design:type", Array)
], CreateRecipeDto.prototype, "components", void 0);
//# sourceMappingURL=create-recipe.dto.js.map