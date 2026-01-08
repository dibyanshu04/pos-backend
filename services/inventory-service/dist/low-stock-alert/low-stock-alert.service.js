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
exports.LowStockAlertService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_ledger_schema_1 = require("../inventory-ledger/inventory-ledger.schema");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
const low_stock_alert_schema_1 = require("./low-stock-alert.schema");
let LowStockAlertService = class LowStockAlertService {
    constructor(alertModel, ledgerModel, rawMaterialModel) {
        this.alertModel = alertModel;
        this.ledgerModel = ledgerModel;
        this.rawMaterialModel = rawMaterialModel;
    }
    async checkAfterDelta(rawMaterialId, outletId, restaurantId, delta, session) {
        const rm = await this.rawMaterialModel.findById(rawMaterialId).session(session);
        if (!rm || !rm.isActive)
            return;
        if (rm.outletId !== outletId)
            return;
        const threshold = rm.lowStockThreshold;
        if (threshold === undefined || threshold === null) {
            await this.resolveIfRecovered(rawMaterialId, outletId, Number.POSITIVE_INFINITY, session);
            return;
        }
        if (threshold < 0) {
            throw new common_1.BadRequestException('lowStockThreshold cannot be negative');
        }
        const currentStock = await this.getCurrentStock(rawMaterialId, outletId, session);
        const previousStock = currentStock - delta;
        if (currentStock > threshold) {
            await this.resolveIfRecovered(rawMaterialId, outletId, currentStock, session);
            return;
        }
        if (previousStock > threshold && currentStock <= threshold) {
            await this.createIfNotExists(rawMaterialId, rm.name, restaurantId, outletId, threshold, currentStock, session);
        }
    }
    async reconcile(rawMaterialId, outletId, restaurantId, session) {
        const rm = await this.rawMaterialModel.findById(rawMaterialId).session(session);
        if (!rm || !rm.isActive)
            return;
        if (rm.outletId !== outletId)
            return;
        const threshold = rm.lowStockThreshold;
        if (threshold === undefined || threshold === null) {
            await this.resolveIfRecovered(rawMaterialId, outletId, Number.POSITIVE_INFINITY, session);
            return;
        }
        if (threshold < 0) {
            throw new common_1.BadRequestException('lowStockThreshold cannot be negative');
        }
        const currentStock = await this.getCurrentStock(rawMaterialId, outletId, session);
        if (currentStock > threshold) {
            await this.resolveIfRecovered(rawMaterialId, outletId, currentStock, session);
        }
        else {
            const open = await this.alertModel
                .findOne({ rawMaterialId, outletId, isResolved: false })
                .session(session)
                .lean();
            if (!open) {
                await this.createIfNotExists(rawMaterialId, rm.name, restaurantId, outletId, threshold, currentStock, session);
            }
        }
    }
    async getActiveAlerts(outletId) {
        return this.alertModel
            .find({ outletId, isResolved: false })
            .sort({ triggeredAt: -1 })
            .lean()
            .exec();
    }
    async getAlertHistory(outletId, rawMaterialId) {
        const filter = { outletId };
        if (rawMaterialId) {
            filter.rawMaterialId = new mongoose_2.Types.ObjectId(rawMaterialId);
        }
        return this.alertModel
            .find(filter)
            .sort({ triggeredAt: -1 })
            .lean()
            .exec();
    }
    async createIfNotExists(rawMaterialId, rawMaterialName, restaurantId, outletId, threshold, stockAtTrigger, session) {
        const existing = await this.alertModel
            .findOne({ rawMaterialId, outletId, isResolved: false })
            .session(session)
            .lean();
        if (existing)
            return;
        await this.alertModel.create([
            {
                restaurantId,
                outletId,
                rawMaterialId,
                rawMaterialName,
                threshold,
                stockAtTrigger,
                isResolved: false,
            },
        ], { session });
    }
    async resolveIfRecovered(rawMaterialId, outletId, currentStock, session) {
        await this.alertModel
            .updateMany({ rawMaterialId, outletId, isResolved: false }, { $set: { isResolved: true, resolvedAt: new Date(), stockAtTrigger: currentStock } }, { session })
            .exec();
    }
    async getCurrentStock(rawMaterialId, outletId, session) {
        const result = await this.ledgerModel
            .aggregate([
            { $match: { rawMaterialId, outletId } },
            { $group: { _id: null, total: { $sum: '$quantityChange' } } },
        ])
            .session(session || undefined);
        return result.length ? result[0].total : 0;
    }
};
exports.LowStockAlertService = LowStockAlertService;
exports.LowStockAlertService = LowStockAlertService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(low_stock_alert_schema_1.LowStockAlert.name)),
    __param(1, (0, mongoose_1.InjectModel)(inventory_ledger_schema_1.InventoryLedger.name)),
    __param(2, (0, mongoose_1.InjectModel)(raw_material_schema_1.RawMaterial.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], LowStockAlertService);
//# sourceMappingURL=low-stock-alert.service.js.map