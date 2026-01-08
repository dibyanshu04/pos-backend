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
exports.CreateRawMaterialDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const raw_material_category_enum_1 = require("../enums/raw-material-category.enum");
const base_unit_enum_1 = require("../../common/units/base-unit.enum");
const purchase_unit_enum_1 = require("../../common/units/purchase-unit.enum");
class CostingDto {
    constructor() {
        this.averageCost = 0;
        this.lastPurchaseCost = 0;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { averageCost: { required: false, type: () => Number, default: 0, minimum: 0 }, lastPurchaseCost: { required: false, type: () => Number, default: 0, minimum: 0 } };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Average landed cost per base unit. Stored snapshot; updated by GRN/ledger later.',
        example: 320.5,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CostingDto.prototype, "averageCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last purchase landed cost per purchase unit (converted to base unit later).',
        example: 310,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CostingDto.prototype, "lastPurchaseCost", void 0);
class CreateRawMaterialDto {
    constructor() {
        this.isActive = true;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { restaurantId: { required: true, type: () => String }, outletId: { required: true, type: () => String }, name: { required: true, type: () => String }, code: { required: true, type: () => String }, category: { required: true, enum: require("../enums/raw-material-category.enum").RawMaterialCategory }, baseUnit: { required: true, enum: require("../../common/units/base-unit.enum").BaseUnitEnum }, purchaseUnit: { required: true, enum: require("../../common/units/purchase-unit.enum").PurchaseUnitEnum }, conversionFactor: { required: true, type: () => Number, minimum: 0.0001 }, isPerishable: { required: true, type: () => Boolean }, shelfLifeInDays: { required: false, type: () => Number, minimum: 1 }, costing: { required: false, type: () => CostingDto }, createdByUserId: { required: false, type: () => String }, updatedByUserId: { required: false, type: () => String }, isActive: { required: false, type: () => Boolean, default: true } };
    }
}
exports.CreateRawMaterialDto = CreateRawMaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Restaurant identifier (multi-tenant boundary)',
        example: 'restaurant-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "restaurantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Outlet identifier (uniqueness scope for code & name)',
        example: 'outlet-789',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "outletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Display name of the raw material',
        example: 'Paneer',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique code per outlet (e.g., RM_PANEER)',
        example: 'RM_PANEER',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: raw_material_category_enum_1.RawMaterialCategory,
        description: 'Category used for grouping & reporting',
        example: raw_material_category_enum_1.RawMaterialCategory.DAIRY,
    }),
    (0, class_validator_1.IsEnum)(raw_material_category_enum_1.RawMaterialCategory),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: base_unit_enum_1.BaseUnitEnum,
        description: 'Internal/base unit for consumption & costing. All math normalizes to this unit (GM/ML/PCS).',
        example: base_unit_enum_1.BaseUnitEnum.GM,
    }),
    (0, class_validator_1.IsEnum)(base_unit_enum_1.BaseUnitEnum),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "baseUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: purchase_unit_enum_1.PurchaseUnitEnum,
        description: 'Purchase unit (input unit). Must be compatible with baseUnit: KG→GM, LTR→ML, BOX/PACK/PCS→PCS.',
        example: purchase_unit_enum_1.PurchaseUnitEnum.KG,
    }),
    (0, class_validator_1.IsEnum)(purchase_unit_enum_1.PurchaseUnitEnum),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "purchaseUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Multiplier to convert purchaseUnit into baseUnit (quantity * conversionFactor). Example: 1 KG = 1000 GM => 1000. Must be > 0.',
        example: 1000,
        minimum: 0.0001,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001, { message: 'conversionFactor must be greater than 0' }),
    __metadata("design:type", Number)
], CreateRawMaterialDto.prototype, "conversionFactor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the item is perishable (shelf life enforced)',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRawMaterialDto.prototype, "isPerishable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Shelf life (in days). Mandatory when isPerishable = true. Leave empty otherwise.',
        example: 5,
    }),
    (0, class_validator_1.ValidateIf)((o) => o.isPerishable === true),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRawMaterialDto.prototype, "shelfLifeInDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Costing snapshot. Values are stored only; ledger updates later.',
        type: CostingDto,
        default: { averageCost: 0, lastPurchaseCost: 0 },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CostingDto),
    __metadata("design:type", CostingDto)
], CreateRawMaterialDto.prototype, "costing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Audit field: user who created the raw material (future auth integration).',
        example: 'user-1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "createdByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Audit field: user who last updated the raw material (future auth integration).',
        example: 'user-1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRawMaterialDto.prototype, "updatedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Active status. Defaults to true. Use status endpoint for soft delete.',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRawMaterialDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-raw-material.dto.js.map