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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const menu_service_client_1 = require("../common/clients/menu-service.client");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
const recipe_schema_1 = require("./recipe.schema");
let RecipeService = class RecipeService {
    constructor(recipeModel, rawMaterialModel, menuServiceClient) {
        this.recipeModel = recipeModel;
        this.rawMaterialModel = rawMaterialModel;
        this.menuServiceClient = menuServiceClient;
    }
    async create(dto) {
        const menuItemSnapshot = await this.menuServiceClient.validateMenuItem(dto.menuItemId, dto.outletId);
        const components = await this.validateAndBuildComponents(dto);
        await this.recipeModel.updateMany({ menuItemId: dto.menuItemId, outletId: dto.outletId, isActive: true }, { $set: { isActive: false, updatedByUserId: dto.createdByUserId } });
        const recipe = new this.recipeModel({
            restaurantId: dto.restaurantId,
            outletId: dto.outletId,
            menuItemId: dto.menuItemId,
            menuItemName: menuItemSnapshot.name,
            components,
            isActive: true,
            createdByUserId: dto.createdByUserId,
        });
        return recipe.save();
    }
    async findByMenuItem(menuItemId, outletId) {
        const recipe = await this.recipeModel
            .findOne({ menuItemId, outletId, isActive: true })
            .lean()
            .exec();
        if (!recipe) {
            throw new common_1.NotFoundException('Active recipe not found for menu item and outlet');
        }
        return recipe;
    }
    async findAll(outletId) {
        if (!outletId) {
            throw new common_1.BadRequestException('outletId is required');
        }
        return this.recipeModel
            .find({ outletId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async updateStatus(id, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid recipe id');
        }
        const recipe = await this.recipeModel.findById(id).exec();
        if (!recipe) {
            throw new common_1.NotFoundException('Recipe not found');
        }
        if (dto.isActive) {
            const conflict = await this.recipeModel.exists({
                _id: { $ne: id },
                menuItemId: recipe.menuItemId,
                outletId: recipe.outletId,
                isActive: true,
            });
            if (conflict) {
                throw new common_1.ConflictException('Another active recipe exists for this menu item and outlet');
            }
        }
        recipe.isActive = dto.isActive;
        recipe.updatedByUserId = dto.updatedByUserId;
        await recipe.save();
        return recipe.toObject();
    }
    async validateAndBuildComponents(dto) {
        var _a;
        if (!((_a = dto.components) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new common_1.BadRequestException('At least one component is required');
        }
        const seen = new Set();
        const components = [];
        for (const comp of dto.components) {
            if (seen.has(comp.rawMaterialId)) {
                throw new common_1.BadRequestException('Duplicate rawMaterialId in components');
            }
            seen.add(comp.rawMaterialId);
            if (comp.quantityPerUnit <= 0) {
                throw new common_1.BadRequestException('quantityPerUnit must be greater than 0');
            }
            const rm = await this.rawMaterialModel.findById(comp.rawMaterialId).lean();
            if (!rm) {
                throw new common_1.NotFoundException('Raw material not found');
            }
            if (!rm.isActive) {
                throw new common_1.BadRequestException('Raw material is inactive');
            }
            if (rm.outletId !== dto.outletId) {
                throw new common_1.BadRequestException('Raw material does not belong to the outlet');
            }
            components.push({
                rawMaterialId: rm._id,
                rawMaterialName: rm.name,
                quantityPerUnit: comp.quantityPerUnit,
                unit: rm.baseUnit,
            });
        }
        return components;
    }
};
exports.RecipeService = RecipeService;
exports.RecipeService = RecipeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(recipe_schema_1.Recipe.name)),
    __param(1, (0, mongoose_1.InjectModel)(raw_material_schema_1.RawMaterial.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        menu_service_client_1.MenuServiceClient])
], RecipeService);
//# sourceMappingURL=recipe.service.js.map