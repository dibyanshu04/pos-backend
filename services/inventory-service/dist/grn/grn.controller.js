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
exports.GrnController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const success_response_dto_1 = require("../common/dto/success-response.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const create_grn_dto_1 = require("./dto/create-grn.dto");
const grn_service_1 = require("./grn.service");
let GrnController = class GrnController {
    constructor(grnService) {
        this.grnService = grnService;
    }
    async create(dto, req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || 'system';
        dto.createdByUserId = dto.createdByUserId || userId;
        const grn = await this.grnService.createGrn(dto, userId);
        return new success_response_dto_1.SuccessResponseDto(grn, 'GRN created successfully');
    }
    async findAll(outletId) {
        const grns = await this.grnService.findAll(outletId);
        return new success_response_dto_1.SuccessResponseDto(grns, 'GRNs retrieved');
    }
    async findOne(id) {
        const grn = await this.grnService.findOne(id);
        return new success_response_dto_1.SuccessResponseDto(grn, 'GRN retrieved');
    }
};
exports.GrnController = GrnController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create GRN (immutable, transactional)',
        description: 'Creates a GRN, snapshots costs, updates weighted average cost, and writes purchase ledger entries atomically. GRNs are immutable.',
    }),
    (0, swagger_1.ApiBody)({ type: create_grn_dto_1.CreateGrnDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'GRN created; ledger and costing updated atomically',
        type: success_response_dto_1.SuccessResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_grn_dto_1.CreateGrnDto, Object]),
    __metadata("design:returntype", Promise)
], GrnController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'List GRNs for an outlet',
        description: 'Returns GRNs (immutable records) for an outlet, sorted newest first.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true, description: 'Outlet ID' }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GrnController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get GRN by id', description: 'Fetches immutable GRN record with cost snapshots.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'GRN ID' }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GrnController.prototype, "findOne", null);
exports.GrnController = GrnController = __decorate([
    (0, swagger_1.ApiTags)('grns'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('grns'),
    __metadata("design:paramtypes", [grn_service_1.GrnService])
], GrnController);
//# sourceMappingURL=grn.controller.js.map