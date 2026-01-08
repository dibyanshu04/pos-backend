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
exports.VendorController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const success_response_dto_1 = require("../common/dto/success-response.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const create_vendor_dto_1 = require("./dto/create-vendor.dto");
const update_vendor_status_dto_1 = require("./dto/update-vendor-status.dto");
const vendor_service_1 = require("./vendor.service");
let VendorController = class VendorController {
    constructor(vendorService) {
        this.vendorService = vendorService;
    }
    async create(dto) {
        const vendor = await this.vendorService.create(dto);
        return new success_response_dto_1.SuccessResponseDto(vendor, 'Vendor created successfully');
    }
    async findAll(outletId) {
        const vendors = await this.vendorService.findAll(outletId);
        return new success_response_dto_1.SuccessResponseDto(vendors, 'Vendors retrieved successfully');
    }
    async updateStatus(id, dto) {
        const vendor = await this.vendorService.updateStatus(id, dto);
        return new success_response_dto_1.SuccessResponseDto(vendor, dto.isActive ? 'Vendor activated' : 'Vendor deactivated');
    }
};
exports.VendorController = VendorController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create vendor', description: 'Adds a vendor for an outlet. Names must be unique per outlet.' }),
    (0, swagger_1.ApiBody)({ type: create_vendor_dto_1.CreateVendorDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vendor created', type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vendor_dto_1.CreateVendorDto]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'List vendors by outlet' }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true, description: 'Outlet ID' }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate/deactivate vendor' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Vendor ID' }),
    (0, swagger_1.ApiBody)({ type: update_vendor_status_dto_1.UpdateVendorStatusDto }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vendor_status_dto_1.UpdateVendorStatusDto]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "updateStatus", null);
exports.VendorController = VendorController = __decorate([
    (0, swagger_1.ApiTags)('vendors'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendor_service_1.VendorService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map