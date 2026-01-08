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
exports.LowStockAlertController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const success_response_dto_1 = require("../common/dto/success-response.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const low_stock_alert_service_1 = require("./low-stock-alert.service");
let LowStockAlertController = class LowStockAlertController {
    constructor(lowStockAlertService) {
        this.lowStockAlertService = lowStockAlertService;
    }
    async getActive(outletId) {
        const alerts = await this.lowStockAlertService.getActiveAlerts(outletId);
        return new success_response_dto_1.SuccessResponseDto(alerts, 'Active low stock alerts');
    }
    async getHistory(outletId, rawMaterialId) {
        const alerts = await this.lowStockAlertService.getAlertHistory(outletId, rawMaterialId);
        return new success_response_dto_1.SuccessResponseDto(alerts, 'Low stock alert history');
    }
};
exports.LowStockAlertController = LowStockAlertController;
__decorate([
    (0, common_1.Get)('low-stock-alerts'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active low stock alerts',
        description: 'Returns open alerts. Alerts are derived from ledger stock and thresholds.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LowStockAlertController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)('low-stock-alerts/history'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get low stock alert history',
        description: 'Returns alert history (resolved + active) filtered by outlet and optional rawMaterialId.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'outletId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'rawMaterialId', required: false }),
    (0, swagger_1.ApiOkResponse)({ type: success_response_dto_1.SuccessResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('outletId')),
    __param(1, (0, common_1.Query)('rawMaterialId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LowStockAlertController.prototype, "getHistory", null);
exports.LowStockAlertController = LowStockAlertController = __decorate([
    (0, swagger_1.ApiTags)('low-stock-alerts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [low_stock_alert_service_1.LowStockAlertService])
], LowStockAlertController);
//# sourceMappingURL=low-stock-alert.controller.js.map