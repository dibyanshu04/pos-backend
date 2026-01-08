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
exports.InventoryLedgerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
const low_stock_alert_service_1 = require("../low-stock-alert/low-stock-alert.service");
const inventory_ledger_schema_1 = require("./inventory-ledger.schema");
let InventoryLedgerService = class InventoryLedgerService {
    constructor(ledgerModel, rawMaterialModel, lowStockAlertService) {
        this.ledgerModel = ledgerModel;
        this.rawMaterialModel = rawMaterialModel;
        this.lowStockAlertService = lowStockAlertService;
    }
    async createOpeningBalance(dto, userId) {
        if (dto.quantity <= 0) {
            throw new common_1.BadRequestException('Opening balance quantity must be greater than 0');
        }
        const rawMaterial = await this.getActiveRawMaterial(dto.rawMaterialId);
        const existingOpening = await this.ledgerModel.exists({
            rawMaterialId: rawMaterial._id,
            outletId: rawMaterial.outletId,
            transactionType: inventory_ledger_schema_1.InventoryTransactionType.OPENING_BALANCE,
        });
        if (existingOpening) {
            throw new common_1.BadRequestException('Opening balance already exists for this raw material and outlet');
        }
        const entry = new this.ledgerModel({
            restaurantId: rawMaterial.restaurantId,
            outletId: rawMaterial.outletId,
            rawMaterialId: rawMaterial._id,
            transactionType: inventory_ledger_schema_1.InventoryTransactionType.OPENING_BALANCE,
            quantityChange: dto.quantity,
            unit: rawMaterial.baseUnit,
            referenceType: inventory_ledger_schema_1.InventoryReferenceType.ADJUSTMENT,
            remarks: dto.remarks,
            createdByUserId: userId,
        });
        const saved = await entry.save();
        await this.lowStockAlertService.checkAfterDelta(rawMaterial._id, rawMaterial.outletId, rawMaterial.restaurantId, dto.quantity);
        return saved;
    }
    async createAdjustment(dto, userId) {
        if (dto.quantityChange === 0) {
            throw new common_1.BadRequestException('quantityChange cannot be zero');
        }
        const rawMaterial = await this.getActiveRawMaterial(dto.rawMaterialId);
        const entry = new this.ledgerModel({
            restaurantId: rawMaterial.restaurantId,
            outletId: rawMaterial.outletId,
            rawMaterialId: rawMaterial._id,
            transactionType: inventory_ledger_schema_1.InventoryTransactionType.ADJUSTMENT,
            quantityChange: dto.quantityChange,
            unit: rawMaterial.baseUnit,
            referenceType: inventory_ledger_schema_1.InventoryReferenceType.ADJUSTMENT,
            remarks: dto.remarks,
            createdByUserId: userId,
        });
        const saved = await entry.save();
        await this.lowStockAlertService.checkAfterDelta(rawMaterial._id, rawMaterial.outletId, rawMaterial.restaurantId, dto.quantityChange);
        return saved;
    }
    async findEntries(rawMaterialId, outletId) {
        const rawMaterial = await this.getRawMaterialOrThrow(rawMaterialId);
        if (rawMaterial.outletId !== outletId) {
            throw new common_1.ForbiddenException('Raw material does not belong to the requested outlet');
        }
        return this.ledgerModel
            .find({ rawMaterialId: rawMaterial._id, outletId })
            .sort({ createdAt: 1 })
            .lean()
            .exec();
    }
    async getCurrentStock(rawMaterialId, outletId) {
        const rawMaterial = await this.getRawMaterialOrThrow(rawMaterialId);
        if (rawMaterial.outletId !== outletId) {
            throw new common_1.ForbiddenException('Raw material does not belong to the requested outlet');
        }
        const result = await this.ledgerModel.aggregate([
            {
                $match: {
                    rawMaterialId: rawMaterial._id,
                    outletId,
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$quantityChange' },
                },
            },
        ]);
        const stock = result.length ? result[0].total : 0;
        return {
            rawMaterialId: rawMaterial._id.toString(),
            outletId,
            restaurantId: rawMaterial.restaurantId,
            unit: rawMaterial.baseUnit,
            stock,
        };
    }
    async getActiveRawMaterial(rawMaterialId) {
        const material = await this.getRawMaterialOrThrow(rawMaterialId);
        if (!material.isActive) {
            throw new common_1.BadRequestException('Raw material is inactive');
        }
        return material;
    }
    async getRawMaterialOrThrow(rawMaterialId) {
        if (!mongoose_2.Types.ObjectId.isValid(rawMaterialId)) {
            throw new common_1.BadRequestException('Invalid rawMaterialId');
        }
        const material = await this.rawMaterialModel.findById(rawMaterialId).lean();
        if (!material) {
            throw new common_1.NotFoundException('Raw material not found');
        }
        return material;
    }
};
exports.InventoryLedgerService = InventoryLedgerService;
exports.InventoryLedgerService = InventoryLedgerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_ledger_schema_1.InventoryLedger.name)),
    __param(1, (0, mongoose_1.InjectModel)(raw_material_schema_1.RawMaterial.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        low_stock_alert_service_1.LowStockAlertService])
], InventoryLedgerService);
//# sourceMappingURL=inventory-ledger.service.js.map