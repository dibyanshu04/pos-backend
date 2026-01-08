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
exports.RawMaterialController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const success_response_dto_1 = require("../common/dto/success-response.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const raw_material_service_1 = require("./raw-material.service");
const create_raw_material_dto_1 = require("./dto/create-raw-material.dto");
const update_raw_material_dto_1 = require("./dto/update-raw-material.dto");
const update_raw_material_status_dto_1 = require("./dto/update-raw-material-status.dto");
const common_2 = require("@nestjs/common");
let RawMaterialController = class RawMaterialController {
    constructor(rawMaterialService) {
        this.rawMaterialService = rawMaterialService;
    }
    async create(createDto) {
        const material = await this.rawMaterialService.create(createDto);
        return new success_response_dto_1.SuccessResponseDto(material, 'Raw material created successfully');
    }
    async findAll(outletId) {
        const materials = await this.rawMaterialService.findAll(outletId);
        return new success_response_dto_1.SuccessResponseDto(materials, 'Raw materials retrieved successfully');
    }
    async findOne(id) {
        const material = await this.rawMaterialService.findOne(id);
        return new success_response_dto_1.SuccessResponseDto(material, 'Raw material retrieved');
    }
    async update(id, updateDto) {
        const updated = await this.rawMaterialService.update(id, updateDto);
        return new success_response_dto_1.SuccessResponseDto(updated, 'Raw material updated successfully');
    }
    async updateStatus(id, statusDto) {
        const updated = await this.rawMaterialService.updateStatus(id, statusDto);
        return new success_response_dto_1.SuccessResponseDto(updated, statusDto.isActive
            ? 'Raw material activated'
            : 'Raw material deactivated');
    }
    async updateLowStockThreshold(id, body) {
        if (body.lowStockThreshold === undefined || body.lowStockThreshold < 0) {
            throw new common_2.BadRequestException('lowStockThreshold must be >= 0');
        }
        const updated = await this.rawMaterialService.updateLowStockThreshold(id, body.lowStockThreshold);
        return new success_response_dto_1.SuccessResponseDto(updated, 'Low stock threshold updated');
    }
};
exports.RawMaterialController = RawMaterialController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create raw material (costing-ready, no stock)',
        description: 'Creates a raw material master. Code & name must be unique per outlet. Costing fields are stored for ledger integration later.',
    }),
    (0, swagger_1.ApiBody)({ type: create_raw_material_dto_1.CreateRawMaterialDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Raw material created',
        type: success_response_dto_1.SuccessResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_raw_material_dto_1.CreateRawMaterialDto]),
    __metadata("design:returntype", Promise)
], RawMaterialController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CHEF'),
    (0, swagger_1.ApiOperation)({
        summary: 'List raw materials by outlet',
        description: 'Returns all raw materials for an outlet (active/inactive). Use isActive filter later when ledger arrives.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'outletId',
        required: true,
        description: 'Outlet ID (uniqueness scope)',
    }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawMaterialController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CHEF'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get raw material by id',
        description: 'Fetch a raw material by id. Includes costing snapshot. No stock information is returned here.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Raw material id' }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawMaterialController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update raw material (no stock changes)',
        description: 'Updates raw material master data. Does not touch stock or ledger.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Raw material id' }),
    (0, swagger_1.ApiBody)({ type: update_raw_material_dto_1.UpdateRawMaterialDto }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_raw_material_dto_1.UpdateRawMaterialDto]),
    __metadata("design:returntype", Promise)
], RawMaterialController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Activate / deactivate raw material (soft delete)',
        description: 'Soft delete via isActive. Prevents hard deletes to keep audit/ledger integrity.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Raw material id' }),
    (0, swagger_1.ApiBody)({ type: update_raw_material_status_dto_1.UpdateRawMaterialStatusDto }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_raw_material_status_dto_1.UpdateRawMaterialStatusDto]),
    __metadata("design:returntype", Promise)
], RawMaterialController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/low-stock-threshold'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set/update low stock threshold (base unit)',
        description: 'Threshold is stored in base unit and used for alerting. Setting triggers immediate reconciliation. Must be >= 0.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Raw material id' }),
    (0, swagger_1.ApiBody)({
        schema: {
            properties: { lowStockThreshold: { type: 'number', minimum: 0, example: 2000 } },
            required: ['lowStockThreshold'],
        },
    }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RawMaterialController.prototype, "updateLowStockThreshold", null);
exports.RawMaterialController = RawMaterialController = __decorate([
    (0, swagger_1.ApiTags)('raw-materials'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('raw-materials'),
    __metadata("design:paramtypes", [raw_material_service_1.RawMaterialService])
], RawMaterialController);
//# sourceMappingURL=raw-material.controller.js.map