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
exports.InventoryReportsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const success_response_dto_1 = require("../common/dto/success-response.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const report_query_dto_1 = require("./dto/report-query.dto");
const inventory_reports_service_1 = require("./inventory-reports.service");
let InventoryReportsController = class InventoryReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async currentStock(query) {
        const data = await this.reportsService.currentStock(query.outletId);
        return new success_response_dto_1.SuccessResponseDto(data, 'Current stock derived from ledger');
    }
    async consumption(query) {
        const range = this.reportsService.validateDateRange(query.from, query.to);
        const data = await this.reportsService.consumption(query.outletId, range);
        return new success_response_dto_1.SuccessResponseDto(data, 'Consumption derived from ledger');
    }
    async wastage(query) {
        const range = this.reportsService.validateDateRange(query.from, query.to);
        const data = await this.reportsService.wastage(query.outletId, range);
        return new success_response_dto_1.SuccessResponseDto(data, 'Wastage derived from ledger');
    }
    async variance(query) {
        const range = this.reportsService.validateDateRange(query.from, query.to);
        const data = await this.reportsService.variance(query.outletId, range);
        return new success_response_dto_1.SuccessResponseDto(data, 'Variance derived from ledger');
    }
};
exports.InventoryReportsController = InventoryReportsController;
__decorate([
    (0, common_1.Get)('current-stock'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Current stock (ledger-derived)',
        description: 'Computes current stock per raw material as SUM(quantityChange). No cached stock; derived live from ledger. stockValue = currentStock * averageCost.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], InventoryReportsController.prototype, "currentStock", null);
__decorate([
    (0, common_1.Get)('consumption'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consumption (sales-driven, ledger-derived)',
        description: 'Aggregates SALE_CONSUMPTION transactions over date range. Quantities shown as positive; value uses averageCost snapshot.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], InventoryReportsController.prototype, "consumption", null);
__decorate([
    (0, common_1.Get)('wastage'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Wastage report (ledger-derived)',
        description: 'Aggregates WASTAGE transactions over date range. Provides total wasted quantity and reason breakup (by remarks).',
    }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], InventoryReportsController.prototype, "wastage", null);
__decorate([
    (0, common_1.Get)('variance'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Variance report (opening + purchases - consumption - wastage ± adjustments - closing)',
        description: 'Fully ledger-derived. Opening = sum before from; closing = sum up to to. Highlights unexplained variance per raw material.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], InventoryReportsController.prototype, "variance", null);
exports.InventoryReportsController = InventoryReportsController = __decorate([
    (0, swagger_1.ApiTags)('inventory-reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('inventory-reports'),
    __metadata("design:paramtypes", [inventory_reports_service_1.InventoryReportsService])
], InventoryReportsController);
//# sourceMappingURL=inventory-reports.controller.js.map