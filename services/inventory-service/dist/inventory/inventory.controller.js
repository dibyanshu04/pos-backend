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
exports.InventoryController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const consume_inventory_dto_1 = require("./dto/consume-inventory.dto");
const cost_snapshot_dto_1 = require("./dto/cost-snapshot.dto");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async consume(body, internalToken) {
        try {
            const result = await this.inventoryService.consumeInventory(body, internalToken);
            return Object.assign({ status: 'ok' }, result);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Consumption failed');
        }
    }
    async costSnapshot(body, internalToken) {
        return this.inventoryService.costSnapshot(body, internalToken);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('inventory/consume'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-internal-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [consume_inventory_dto_1.ConsumeInventoryDto, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "consume", null);
__decorate([
    (0, common_1.Post)('raw-materials/cost-snapshot'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-internal-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cost_snapshot_dto_1.CostSnapshotDto, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "costSnapshot", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('internal'),
    (0, common_1.Controller)('internal'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map