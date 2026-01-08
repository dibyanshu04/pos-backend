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
exports.RecipeSchema = exports.Recipe = exports.RecipeComponent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_unit_enum_1 = require("../common/units/base-unit.enum");
class RecipeComponent {
}
exports.RecipeComponent = RecipeComponent;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RawMaterial', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RecipeComponent.prototype, "rawMaterialId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], RecipeComponent.prototype, "rawMaterialName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0.0001 }),
    __metadata("design:type", Number)
], RecipeComponent.prototype, "quantityPerUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: base_unit_enum_1.BaseUnitEnum, required: true }),
    __metadata("design:type", String)
], RecipeComponent.prototype, "unit", void 0);
let Recipe = class Recipe {
};
exports.Recipe = Recipe;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], Recipe.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], Recipe.prototype, "outletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, index: true }),
    __metadata("design:type", String)
], Recipe.prototype, "menuItemId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Recipe.prototype, "menuItemName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [RecipeComponent], required: true }),
    __metadata("design:type", Array)
], Recipe.prototype, "components", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true, index: true }),
    __metadata("design:type", Boolean)
], Recipe.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Recipe.prototype, "createdByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Recipe.prototype, "updatedByUserId", void 0);
exports.Recipe = Recipe = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Recipe);
exports.RecipeSchema = mongoose_1.SchemaFactory.createForClass(Recipe);
exports.RecipeSchema.index({ outletId: 1, menuItemId: 1, isActive: 1 });
exports.RecipeSchema.index({ outletId: 1, isActive: 1 });
//# sourceMappingURL=recipe.schema.js.map