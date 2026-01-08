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
exports.GrnService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const unit_conversion_util_1 = require("../common/units/unit-conversion.util");
const unit_validation_util_1 = require("../common/units/unit-validation.util");
const inventory_ledger_schema_1 = require("../inventory-ledger/inventory-ledger.schema");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
const vendor_schema_1 = require("../vendor/vendor.schema");
const low_stock_alert_service_1 = require("../low-stock-alert/low-stock-alert.service");
const grn_schema_1 = require("./grn.schema");
let GrnService = class GrnService {
    constructor(grnModel, vendorModel, rawMaterialModel, ledgerModel, lowStockAlertService) {
        this.grnModel = grnModel;
        this.vendorModel = vendorModel;
        this.rawMaterialModel = rawMaterialModel;
        this.ledgerModel = ledgerModel;
        this.lowStockAlertService = lowStockAlertService;
    }
    async createGrn(dto, userId) {
        var _a, _b;
        const session = await this.grnModel.db.startSession();
        session.startTransaction();
        try {
            const vendor = await this.vendorModel
                .findOne({ _id: dto.vendorId, outletId: dto.outletId })
                .session(session)
                .lean();
            if (!vendor) {
                throw new common_1.NotFoundException('Vendor not found for outlet');
            }
            if (!vendor.isActive) {
                throw new common_1.BadRequestException('Vendor is inactive');
            }
            if (dto.invoiceNumber) {
                const duplicate = await this.grnModel
                    .findOne({
                    outletId: dto.outletId,
                    invoiceNumber: dto.invoiceNumber,
                })
                    .session(session)
                    .lean();
                if (duplicate) {
                    throw new common_1.ConflictException('GRN with this invoice number already exists for this outlet');
                }
            }
            if (!((_a = dto.items) === null || _a === void 0 ? void 0 : _a.length)) {
                throw new common_1.BadRequestException('At least one GRN item is required');
            }
            const grnItems = [];
            const ledgerEntries = [];
            let totalPurchaseCost = 0;
            const existingStockMap = new Map();
            const seenRawMaterials = new Set();
            for (const item of dto.items) {
                if (item.purchaseQuantity <= 0) {
                    throw new common_1.BadRequestException('purchaseQuantity must be greater than 0');
                }
                if (item.unitCost <= 0) {
                    throw new common_1.BadRequestException('unitCost must be greater than 0');
                }
                const rm = await this.rawMaterialModel.findById(item.rawMaterialId).session(session).lean();
                if (!rm) {
                    throw new common_1.NotFoundException('Raw material not found');
                }
                if (!rm.isActive) {
                    throw new common_1.BadRequestException('Raw material is inactive');
                }
                if (rm.outletId !== dto.outletId) {
                    throw new common_1.BadRequestException('Raw material does not belong to the outlet');
                }
                if (seenRawMaterials.has(rm._id.toString())) {
                    throw new common_1.BadRequestException('Duplicate rawMaterialId in GRN items');
                }
                seenRawMaterials.add(rm._id.toString());
                (0, unit_validation_util_1.validateUnitCompatibility)(rm.purchaseUnit, rm.baseUnit);
                if (!existingStockMap.has(rm._id.toString())) {
                    const existingStockAgg = await this.ledgerModel
                        .aggregate([
                        { $match: { rawMaterialId: rm._id, outletId: rm.outletId } },
                        { $group: { _id: null, total: { $sum: '$quantityChange' } } },
                    ])
                        .session(session);
                    const existingQty = existingStockAgg.length ? existingStockAgg[0].total : 0;
                    existingStockMap.set(rm._id.toString(), existingQty);
                }
                const baseQuantity = (0, unit_conversion_util_1.convertToBaseUnit)(item.purchaseQuantity, rm.purchaseUnit, rm.baseUnit, rm.conversionFactor);
                const unitCostBase = item.unitCost / rm.conversionFactor;
                const totalCost = baseQuantity * unitCostBase;
                grnItems.push({
                    rawMaterialId: rm._id,
                    rawMaterialName: rm.name,
                    purchaseQuantity: item.purchaseQuantity,
                    purchaseUnit: rm.purchaseUnit,
                    baseQuantity,
                    baseUnit: rm.baseUnit,
                    unitCost: unitCostBase,
                    totalCost,
                });
                ledgerEntries.push({
                    restaurantId: rm.restaurantId,
                    outletId: rm.outletId,
                    rawMaterialId: rm._id,
                    transactionType: inventory_ledger_schema_1.InventoryTransactionType.PURCHASE,
                    quantityChange: baseQuantity,
                    unit: rm.baseUnit,
                    referenceType: inventory_ledger_schema_1.InventoryReferenceType.GRN,
                    referenceId: undefined,
                    remarks: dto.invoiceNumber ? `GRN ${dto.invoiceNumber}` : 'GRN',
                    createdByUserId: userId,
                    createdAt: new Date(),
                });
                totalPurchaseCost += totalCost;
            }
            const [grn] = await this.grnModel.create([
                {
                    restaurantId: dto.restaurantId,
                    outletId: dto.outletId,
                    vendorId: dto.vendorId,
                    vendorName: vendor.name,
                    invoiceNumber: dto.invoiceNumber,
                    invoiceDate: dto.invoiceDate,
                    items: grnItems,
                    totalPurchaseCost,
                    createdByUserId: userId,
                },
            ], { session });
            const ledgerEntriesWithRef = ledgerEntries.map((entry) => (Object.assign(Object.assign({}, entry), { referenceId: grn._id })));
            await this.ledgerModel.insertMany(ledgerEntriesWithRef, { session });
            for (const item of grnItems) {
                await this.updateRawMaterialCosting(session, item.rawMaterialId, (_b = existingStockMap.get(item.rawMaterialId.toString())) !== null && _b !== void 0 ? _b : 0, item.baseQuantity, item.unitCost, userId);
                await this.lowStockAlertService.checkAfterDelta(item.rawMaterialId, dto.outletId, dto.restaurantId, item.baseQuantity, session);
            }
            await session.commitTransaction();
            return grn.toObject();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async findAll(outletId) {
        if (!outletId) {
            throw new common_1.BadRequestException('outletId is required');
        }
        return this.grnModel.find({ outletId }).sort({ createdAt: -1 }).lean().exec();
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid grn id');
        }
        const grn = await this.grnModel.findById(id).lean().exec();
        if (!grn) {
            throw new common_1.NotFoundException('GRN not found');
        }
        return grn;
    }
    async updateRawMaterialCosting(session, rawMaterialId, existingQtyBefore, newBaseQty, newUnitCostBase, userId) {
        var _a, _b;
        const rawMaterial = await this.rawMaterialModel.findById(rawMaterialId).session(session);
        if (!rawMaterial) {
            throw new common_1.NotFoundException('Raw material not found during costing update');
        }
        const safeExistingQty = existingQtyBefore > 0 ? existingQtyBefore : 0;
        const existingAvg = (_b = (_a = rawMaterial.costing) === null || _a === void 0 ? void 0 : _a.averageCost) !== null && _b !== void 0 ? _b : 0;
        const existingValue = safeExistingQty * existingAvg;
        const newValue = newBaseQty * newUnitCostBase;
        const combinedQty = safeExistingQty + newBaseQty;
        const newAverageCost = combinedQty > 0 ? (existingValue + newValue) / combinedQty : newUnitCostBase;
        rawMaterial.costing = {
            averageCost: newAverageCost,
            lastPurchaseCost: newUnitCostBase,
        };
        rawMaterial.updatedByUserId = userId;
        await rawMaterial.save({ session });
    }
};
exports.GrnService = GrnService;
exports.GrnService = GrnService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(grn_schema_1.Grn.name)),
    __param(1, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __param(2, (0, mongoose_1.InjectModel)(raw_material_schema_1.RawMaterial.name)),
    __param(3, (0, mongoose_1.InjectModel)(inventory_ledger_schema_1.InventoryLedger.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        low_stock_alert_service_1.LowStockAlertService])
], GrnService);
//# sourceMappingURL=grn.service.js.map