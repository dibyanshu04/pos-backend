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
exports.RawMaterialService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const unit_validation_util_1 = require("../common/units/unit-validation.util");
const low_stock_alert_service_1 = require("../low-stock-alert/low-stock-alert.service");
const raw_material_schema_1 = require("./raw-material.schema");
let RawMaterialService = class RawMaterialService {
    constructor(rawMaterialModel, lowStockAlertService) {
        this.rawMaterialModel = rawMaterialModel;
        this.lowStockAlertService = lowStockAlertService;
    }
    async create(createDto) {
        var _a;
        this.validateUnits(createDto.purchaseUnit, createDto.baseUnit, createDto.conversionFactor);
        await this.ensureUniquePerOutlet(createDto.outletId, createDto.code, createDto.name);
        const costing = this.normalizeCosting(createDto.costing);
        const material = new this.rawMaterialModel({
            restaurantId: createDto.restaurantId,
            outletId: createDto.outletId,
            name: createDto.name.trim(),
            code: createDto.code.trim(),
            category: createDto.category,
            baseUnit: createDto.baseUnit,
            purchaseUnit: createDto.purchaseUnit,
            conversionFactor: createDto.conversionFactor,
            isPerishable: createDto.isPerishable,
            shelfLifeInDays: createDto.isPerishable
                ? createDto.shelfLifeInDays
                : undefined,
            costing,
            isActive: (_a = createDto.isActive) !== null && _a !== void 0 ? _a : true,
            createdByUserId: createDto.createdByUserId,
            updatedByUserId: createDto.updatedByUserId,
        });
        return material.save();
    }
    async findAll(outletId) {
        if (!outletId) {
            throw new common_1.BadRequestException('outletId is required');
        }
        return this.rawMaterialModel
            .find({ outletId })
            .sort({ name: 1 })
            .lean()
            .exec();
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid raw material id');
        }
        const material = await this.rawMaterialModel.findById(id).lean().exec();
        if (!material) {
            throw new common_1.NotFoundException('Raw material not found');
        }
        return material;
    }
    async update(id, updateDto) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid raw material id');
        }
        const existing = await this.rawMaterialModel.findById(id).exec();
        if (!existing) {
            throw new common_1.NotFoundException('Raw material not found');
        }
        this.validateUnits((_a = updateDto.purchaseUnit) !== null && _a !== void 0 ? _a : existing.purchaseUnit, (_b = updateDto.baseUnit) !== null && _b !== void 0 ? _b : existing.baseUnit, (_c = updateDto.conversionFactor) !== null && _c !== void 0 ? _c : existing.conversionFactor);
        await this.ensureUniquePerOutlet(existing.outletId, (_d = updateDto.code) !== null && _d !== void 0 ? _d : existing.code, (_e = updateDto.name) !== null && _e !== void 0 ? _e : existing.name, id);
        const updatePayload = {
            name: (_f = updateDto.name) === null || _f === void 0 ? void 0 : _f.trim(),
            code: (_g = updateDto.code) === null || _g === void 0 ? void 0 : _g.trim(),
            category: updateDto.category,
            baseUnit: updateDto.baseUnit,
            purchaseUnit: updateDto.purchaseUnit,
            conversionFactor: updateDto.conversionFactor,
            isPerishable: updateDto.isPerishable,
            shelfLifeInDays: updateDto.isPerishable === true
                ? updateDto.shelfLifeInDays
                : updateDto.isPerishable === false
                    ? undefined
                    : updateDto.shelfLifeInDays,
            costing: updateDto.costing
                ? this.normalizeCosting(updateDto.costing, existing.costing)
                : undefined,
            updatedByUserId: updateDto.updatedByUserId,
        };
        Object.keys(updatePayload).forEach((key) => {
            if (updatePayload[key] === undefined) {
                delete updatePayload[key];
            }
        });
        const updated = await this.rawMaterialModel
            .findByIdAndUpdate(id, updatePayload, { new: true })
            .lean()
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException('Raw material not found');
        }
        return updated;
    }
    async updateStatus(id, statusDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid raw material id');
        }
        const existing = await this.rawMaterialModel.findById(id).exec();
        if (!existing) {
            throw new common_1.NotFoundException('Raw material not found');
        }
        existing.isActive = statusDto.isActive;
        if (statusDto.updatedByUserId) {
            existing.updatedByUserId = statusDto.updatedByUserId;
        }
        await existing.save();
        return existing.toObject();
    }
    async updateLowStockThreshold(id, lowStockThreshold) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid raw material id');
        }
        if (lowStockThreshold < 0) {
            throw new common_1.BadRequestException('lowStockThreshold must be >= 0');
        }
        const rm = await this.rawMaterialModel.findById(id);
        if (!rm) {
            throw new common_1.NotFoundException('Raw material not found');
        }
        rm.lowStockThreshold = lowStockThreshold;
        await rm.save();
        await this.lowStockAlertService.reconcile(rm._id, rm.outletId, rm.restaurantId);
        return rm.toObject();
    }
    async ensureUniquePerOutlet(outletId, code, name, excludeId) {
        const codeFilter = { outletId, code: code.trim() };
        const nameFilter = { outletId, name: name.trim() };
        if (excludeId) {
            codeFilter._id = { $ne: excludeId };
            nameFilter._id = { $ne: excludeId };
        }
        const [codeExists, nameExists] = await Promise.all([
            this.rawMaterialModel.exists(codeFilter),
            this.rawMaterialModel.exists(nameFilter),
        ]);
        if (codeExists) {
            throw new common_1.ConflictException('Code must be unique per outlet');
        }
        if (nameExists) {
            throw new common_1.ConflictException('Name must be unique per outlet');
        }
    }
    normalizeCosting(costing, fallback) {
        var _a, _b, _c, _d;
        const base = fallback !== null && fallback !== void 0 ? fallback : { averageCost: 0, lastPurchaseCost: 0 };
        return {
            averageCost: (_b = (_a = costing === null || costing === void 0 ? void 0 : costing.averageCost) !== null && _a !== void 0 ? _a : base.averageCost) !== null && _b !== void 0 ? _b : 0,
            lastPurchaseCost: (_d = (_c = costing === null || costing === void 0 ? void 0 : costing.lastPurchaseCost) !== null && _c !== void 0 ? _c : base.lastPurchaseCost) !== null && _d !== void 0 ? _d : 0,
        };
    }
    validateUnits(purchaseUnit, baseUnit, conversionFactor) {
        if (conversionFactor === undefined || conversionFactor <= 0) {
            throw new common_1.BadRequestException('conversionFactor must be greater than 0');
        }
        try {
            (0, unit_validation_util_1.validateUnitCompatibility)(purchaseUnit, baseUnit);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Invalid unit combination';
            throw new common_1.BadRequestException(message);
        }
    }
};
exports.RawMaterialService = RawMaterialService;
exports.RawMaterialService = RawMaterialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(raw_material_schema_1.RawMaterial.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        low_stock_alert_service_1.LowStockAlertService])
], RawMaterialService);
//# sourceMappingURL=raw-material.service.js.map