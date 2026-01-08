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
exports.InventoryLedgerController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const success_response_dto_1 = require("../common/dto/success-response.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const adjustment_dto_1 = require("./dto/adjustment.dto");
const opening_balance_dto_1 = require("./dto/opening-balance.dto");
const inventory_ledger_service_1 = require("./inventory-ledger.service");
let InventoryLedgerController = class InventoryLedgerController {
    constructor(ledgerService) {
        this.ledgerService = ledgerService;
    }
    async createOpeningBalance(dto, req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || 'system';
        const entry = await this.ledgerService.createOpeningBalance(dto, userId);
        return new success_response_dto_1.SuccessResponseDto(entry, 'Opening balance recorded');
    }
    async createAdjustment(dto, req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || 'system';
        const entry = await this.ledgerService.createAdjustment(dto, userId);
        return new success_response_dto_1.SuccessResponseDto(entry, 'Adjustment recorded');
    }
    async findEntries(rawMaterialId, outletId) {
        const entries = await this.ledgerService.findEntries(rawMaterialId, outletId);
        return new success_response_dto_1.SuccessResponseDto(entries, 'Ledger entries retrieved');
    }
    async getCurrentStock(rawMaterialId, outletId) {
        const stock = await this.ledgerService.getCurrentStock(rawMaterialId, outletId);
        return new success_response_dto_1.SuccessResponseDto(stock, 'Derived stock computed from ledger (append-only, immutable)');
    }
};
exports.InventoryLedgerController = InventoryLedgerController;
__decorate([
    (0, common_1.Post)('opening-balance'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create opening balance (one-time per raw material per outlet)',
        description: 'Records the initial stock as an immutable ledger entry. Allowed once per raw material per outlet. Ledger is append-only.',
    }),
    (0, swagger_1.ApiBody)({ type: opening_balance_dto_1.OpeningBalanceDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Opening balance recorded',
        type: success_response_dto_1.SuccessResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [opening_balance_dto_1.OpeningBalanceDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryLedgerController.prototype, "createOpeningBalance", null);
__decorate([
    (0, common_1.Post)('adjustment'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create manual adjustment (append-only)',
        description: 'Adds a positive/negative adjustment entry. No edits or deletes; corrections are new entries.',
    }),
    (0, swagger_1.ApiBody)({ type: adjustment_dto_1.AdjustmentDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Adjustment recorded',
        type: success_response_dto_1.SuccessResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adjustment_dto_1.AdjustmentDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryLedgerController.prototype, "createAdjustment", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CHEF'),
    (0, swagger_1.ApiOperation)({
        summary: 'List ledger entries (chronological)',
        description: 'Returns immutable ledger entries for a raw material & outlet, sorted by creation time.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'rawMaterialId', required: true, description: 'Raw material ID' }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true, description: 'Outlet ID' }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('rawMaterialId')),
    __param(1, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryLedgerController.prototype, "findEntries", null);
__decorate([
    (0, common_1.Get)('stock'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CHEF'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current stock (derived, never stored)',
        description: 'Computes stock as SUM(quantityChange). No currentStock field exists; ledger is the single source of truth.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'rawMaterialId', required: true, description: 'Raw material ID' }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true, description: 'Outlet ID' }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('rawMaterialId')),
    __param(1, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryLedgerController.prototype, "getCurrentStock", null);
exports.InventoryLedgerController = InventoryLedgerController = __decorate([
    (0, swagger_1.ApiTags)('inventory-ledger'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('inventory-ledger'),
    __metadata("design:paramtypes", [inventory_ledger_service_1.InventoryLedgerService])
], InventoryLedgerController);
//# sourceMappingURL=inventory-ledger.controller.js.map