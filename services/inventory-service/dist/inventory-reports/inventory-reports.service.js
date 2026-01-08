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
exports.InventoryReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_ledger_schema_1 = require("../inventory-ledger/inventory-ledger.schema");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
let InventoryReportsService = class InventoryReportsService {
    constructor(ledgerModel, rawMaterialModel) {
        this.ledgerModel = ledgerModel;
        this.rawMaterialModel = rawMaterialModel;
    }
    async currentStock(outletId) {
        const stock = await this.ledgerModel
            .aggregate([
            { $match: { outletId } },
            {
                $group: {
                    _id: '$rawMaterialId',
                    quantity: { $sum: '$quantityChange' },
                },
            },
            {
                $lookup: {
                    from: 'rawmaterials',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'rm',
                },
            },
            { $unwind: '$rm' },
            {
                $project: {
                    rawMaterialId: '$_id',
                    rawMaterialName: '$rm.name',
                    unit: '$rm.baseUnit',
                    averageCost: '$rm.costing.averageCost',
                    currentStock: '$quantity',
                    stockValue: { $multiply: ['$quantity', '$rm.costing.averageCost'] },
                },
            },
            { $sort: { rawMaterialName: 1 } },
        ])
            .exec();
        return stock;
    }
    async consumption(outletId, range) {
        const match = {
            outletId,
            transactionType: inventory_ledger_schema_1.InventoryTransactionType.SALE_CONSUMPTION,
        };
        this.applyDateFilter(match, range);
        const rows = await this.ledgerModel
            .aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$rawMaterialId',
                    qty: { $sum: '$quantityChange' },
                },
            },
            {
                $lookup: {
                    from: 'rawmaterials',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'rm',
                },
            },
            { $unwind: '$rm' },
            {
                $project: {
                    rawMaterialId: '$_id',
                    rawMaterialName: '$rm.name',
                    unit: '$rm.baseUnit',
                    consumedQuantity: { $abs: '$qty' },
                    consumedValue: { $multiply: [{ $abs: '$qty' }, '$rm.costing.averageCost'] },
                },
            },
            { $sort: { rawMaterialName: 1 } },
        ])
            .exec();
        return rows;
    }
    async wastage(outletId, range) {
        const match = {
            outletId,
            transactionType: inventory_ledger_schema_1.InventoryTransactionType.WASTAGE,
        };
        this.applyDateFilter(match, range);
        const rows = await this.ledgerModel
            .aggregate([
            { $match: match },
            {
                $group: {
                    _id: { rawMaterialId: '$rawMaterialId', reason: '$remarks' },
                    qty: { $sum: '$quantityChange' },
                },
            },
            {
                $group: {
                    _id: '$_id.rawMaterialId',
                    total: { $sum: '$qty' },
                    reasons: {
                        $push: {
                            reason: { $ifNull: ['$_id.reason', 'UNSPECIFIED'] },
                            qty: '$qty',
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'rawmaterials',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'rm',
                },
            },
            { $unwind: '$rm' },
            {
                $project: {
                    rawMaterialId: '$_id',
                    rawMaterialName: '$rm.name',
                    unit: '$rm.baseUnit',
                    wastedQuantity: { $abs: '$total' },
                    reasonBreakup: {
                        $arrayToObject: {
                            $map: {
                                input: '$reasons',
                                as: 'r',
                                in: ['$$r.reason', { $abs: '$$r.qty' }],
                            },
                        },
                    },
                },
            },
            { $sort: { rawMaterialName: 1 } },
        ])
            .exec();
        return rows;
    }
    async variance(outletId, range) {
        const { from, to } = range;
        const fromDate = from !== null && from !== void 0 ? from : new Date(0);
        const toDate = to !== null && to !== void 0 ? to : new Date();
        const [openingRows, closingRows, inRangeRows] = await Promise.all([
            this.aggregateSumByMaterial(outletId, { to: fromDate, exclusiveEnd: true }),
            this.aggregateSumByMaterial(outletId, { to: toDate, inclusiveEnd: true }),
            this.aggregateSumsByType(outletId, fromDate, toDate),
        ]);
        const openingMap = new Map();
        openingRows.forEach((r) => openingMap.set(r._id.toString(), r.total));
        const closingMap = new Map();
        closingRows.forEach((r) => closingMap.set(r._id.toString(), r.total));
        const typeMap = new Map();
        inRangeRows.forEach((r) => {
            const key = r._id.rawMaterialId.toString();
            const existing = typeMap.get(key) || { purchased: 0, consumed: 0, wasted: 0, adjustments: 0 };
            switch (r._id.transactionType) {
                case inventory_ledger_schema_1.InventoryTransactionType.PURCHASE:
                    existing.purchased += r.total;
                    break;
                case inventory_ledger_schema_1.InventoryTransactionType.SALE_CONSUMPTION:
                    existing.consumed += Math.abs(r.total);
                    break;
                case inventory_ledger_schema_1.InventoryTransactionType.WASTAGE:
                    existing.wasted += Math.abs(r.total);
                    break;
                case inventory_ledger_schema_1.InventoryTransactionType.ADJUSTMENT:
                    existing.adjustments += r.total;
                    break;
                default:
                    break;
            }
            typeMap.set(key, existing);
        });
        const idsSet = new Set([
            ...openingMap.keys(),
            ...closingMap.keys(),
            ...typeMap.keys(),
        ]);
        const rawMaterials = await this.rawMaterialModel
            .find({ _id: { $in: Array.from(idsSet).map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .lean()
            .exec();
        const rmMap = new Map();
        rawMaterials.forEach((rm) => rmMap.set(rm._id.toString(), rm));
        const results = Array.from(idsSet).map((id) => {
            var _a, _b;
            const rm = rmMap.get(id);
            const openingStock = (_a = openingMap.get(id)) !== null && _a !== void 0 ? _a : 0;
            const closingStock = (_b = closingMap.get(id)) !== null && _b !== void 0 ? _b : 0;
            const typeAgg = typeMap.get(id) || {
                purchased: 0,
                consumed: 0,
                wasted: 0,
                adjustments: 0,
            };
            const variance = openingStock +
                typeAgg.purchased -
                typeAgg.consumed -
                typeAgg.wasted +
                typeAgg.adjustments -
                closingStock;
            return {
                rawMaterialId: id,
                rawMaterialName: (rm === null || rm === void 0 ? void 0 : rm.name) || 'Unknown',
                unit: rm === null || rm === void 0 ? void 0 : rm.baseUnit,
                openingStock,
                purchased: typeAgg.purchased,
                consumed: typeAgg.consumed,
                wasted: typeAgg.wasted,
                adjustments: typeAgg.adjustments,
                closingStock,
                variance,
            };
        });
        return results;
    }
    applyDateFilter(match, range) {
        if (range.from || range.to) {
            match.createdAt = {};
            if (range.from) {
                match.createdAt.$gte = range.from;
            }
            if (range.to) {
                match.createdAt.$lte = range.to;
            }
        }
    }
    async aggregateSumByMaterial(outletId, opts) {
        const match = { outletId };
        if (opts.to) {
            match.createdAt = {};
            if (opts.exclusiveEnd) {
                match.createdAt.$lt = opts.to;
            }
            if (opts.inclusiveEnd) {
                match.createdAt.$lte = opts.to;
            }
        }
        return this.ledgerModel
            .aggregate([
            { $match: match },
            { $group: { _id: '$rawMaterialId', total: { $sum: '$quantityChange' } } },
        ])
            .exec();
    }
    async aggregateSumsByType(outletId, from, to) {
        return this.ledgerModel
            .aggregate([
            {
                $match: {
                    outletId,
                    createdAt: { $gte: from, $lte: to },
                    transactionType: {
                        $in: [
                            inventory_ledger_schema_1.InventoryTransactionType.PURCHASE,
                            inventory_ledger_schema_1.InventoryTransactionType.SALE_CONSUMPTION,
                            inventory_ledger_schema_1.InventoryTransactionType.WASTAGE,
                            inventory_ledger_schema_1.InventoryTransactionType.ADJUSTMENT,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: { rawMaterialId: '$rawMaterialId', transactionType: '$transactionType' },
                    total: { $sum: '$quantityChange' },
                },
            },
        ])
            .exec();
    }
    validateDateRange(from, to) {
        let fromDate;
        let toDate;
        if (from) {
            fromDate = new Date(from);
            if (isNaN(fromDate.getTime()))
                throw new common_1.BadRequestException('Invalid from date');
        }
        if (to) {
            toDate = new Date(to);
            if (isNaN(toDate.getTime()))
                throw new common_1.BadRequestException('Invalid to date');
        }
        if (fromDate && toDate && fromDate > toDate) {
            throw new common_1.BadRequestException('from date cannot be after to date');
        }
        const now = new Date();
        if (fromDate && fromDate > now) {
            throw new common_1.BadRequestException('from date cannot be in the future');
        }
        if (toDate && toDate > now) {
            throw new common_1.BadRequestException('to date cannot be in the future');
        }
        return { from: fromDate, to: toDate };
    }
};
exports.InventoryReportsService = InventoryReportsService;
exports.InventoryReportsService = InventoryReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_ledger_schema_1.InventoryLedger.name)),
    __param(1, (0, mongoose_1.InjectModel)(raw_material_schema_1.RawMaterial.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], InventoryReportsService);
//# sourceMappingURL=inventory-reports.service.js.map