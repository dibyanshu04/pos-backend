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
exports.RecipeController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const success_response_dto_1 = require("../common/dto/success-response.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const create_recipe_dto_1 = require("./dto/create-recipe.dto");
const update_recipe_status_dto_1 = require("./dto/update-recipe-status.dto");
const recipe_service_1 = require("./recipe.service");
let RecipeController = class RecipeController {
    constructor(recipeService) {
        this.recipeService = recipeService;
    }
    async create(dto, req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || 'system';
        dto.createdByUserId = dto.createdByUserId || userId;
        const recipe = await this.recipeService.create(dto);
        return new success_response_dto_1.SuccessResponseDto(recipe, 'Recipe created and previous active recipe deactivated');
    }
    async findByMenuItem(menuItemId, outletId) {
        const recipe = await this.recipeService.findByMenuItem(menuItemId, outletId);
        return new success_response_dto_1.SuccessResponseDto(recipe, 'Active recipe retrieved');
    }
    async findAll(outletId) {
        const recipes = await this.recipeService.findAll(outletId);
        return new success_response_dto_1.SuccessResponseDto(recipes, 'Recipes retrieved');
    }
    async updateStatus(id, dto, req) {
        var _a, _b;
        dto.updatedByUserId = dto.updatedByUserId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || 'system';
        const recipe = await this.recipeService.updateStatus(id, dto);
        return new success_response_dto_1.SuccessResponseDto(recipe, dto.isActive ? 'Recipe activated' : 'Recipe deactivated');
    }
};
exports.RecipeController = RecipeController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create/replace recipe for a menu item (append-only pattern)',
        description: 'Creates a new recipe and deactivates any existing active recipe for the same menu item and outlet. Recipes are immutable snapshots; edits create new documents.',
    }),
    (0, swagger_1.ApiBody)({ type: create_recipe_dto_1.CreateRecipeDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Recipe created; previous active recipe (if any) deactivated',
        type: success_response_dto_1.SuccessResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_recipe_dto_1.CreateRecipeDto, Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('menu-item/:menuItemId'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CHEF'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active recipe for a menu item (outlet-scoped)',
        description: 'Returns the currently active recipe for the specified menu item and outlet. Snapshot is used by order-service during consumption.',
    }),
    (0, swagger_1.ApiParam)({ name: 'menuItemId', description: 'Menu item ID' }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true, description: 'Outlet ID' }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('menuItemId')),
    __param(1, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "findByMenuItem", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CHEF'),
    (0, swagger_1.ApiOperation)({
        summary: 'List recipes for an outlet',
        description: 'Returns all recipes (active/inactive) for an outlet. Historical recipes remain for audit/snapshots.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true, description: 'Outlet ID' }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Enable/disable a recipe (soft toggle)',
        description: 'Soft toggle recipe. Enabling enforces single active recipe per menu item per outlet. No hard deletes.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Recipe ID' }),
    (0, swagger_1.ApiBody)({ type: update_recipe_status_dto_1.UpdateRecipeStatusDto }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_recipe_status_dto_1.UpdateRecipeStatusDto, Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "updateStatus", null);
exports.RecipeController = RecipeController = __decorate([
    (0, swagger_1.ApiTags)('recipes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('recipes'),
    __metadata("design:paramtypes", [recipe_service_1.RecipeService])
], RecipeController);
//# sourceMappingURL=recipe.controller.js.map