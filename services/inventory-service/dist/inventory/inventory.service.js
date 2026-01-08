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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_ledger_schema_1 = require("./schemas/inventory-ledger.schema");
const raw_material_schema_1 = require("./schemas/raw-material.schema");
let InventoryService = class InventoryService {
    constructor(ledgerModel, rawMaterialModel, connection) {
        this.ledgerModel = ledgerModel;
        this.rawMaterialModel = rawMaterialModel;
        this.connection = connection;
    }
    assertInternalToken(headerToken) {
        const expected = process.env.INVENTORY_INTERNAL_TOKEN || '';
        if (expected && headerToken !== expected) {
            throw new common_1.UnauthorizedException('Unauthorized internal access');
        }
    }
    async consumeInventory(dto, internalToken) {
        this.assertInternalToken(internalToken);
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const { orderId } = dto;
            const existing = await this.ledgerModel
                .findOne({
                referenceType: 'ORDER',
                referenceId: orderId,
                transactionType: 'SALE_CONSUMPTION',
            })
                .session(session)
                .exec();
            if (existing) {
                await session.abortTransaction();
                session.endSession();
                return { ledgerEntryIds: [] };
            }
            const docs = [];
            for (const item of dto.items) {
                for (const component of item.recipeSnapshot) {
                    const consumedQty = item.quantityOrdered * component.quantityPerUnit;
                    if (!Number.isFinite(consumedQty) || consumedQty <= 0) {
                        throw new Error(`Invalid consumption quantity for raw material ${component.rawMaterialId}`);
                    }
                    const rawMat = await this.rawMaterialModel
                        .findById(component.rawMaterialId)
                        .session(session)
                        .exec();
                    if (!rawMat) {
                        throw new Error(`Raw material ${component.rawMaterialId} not found`);
                    }
                    if (rawMat.isActive === false) {
                        throw new Error(`Raw material ${rawMat.name} is inactive`);
                    }
                    if (rawMat.baseUnit && rawMat.baseUnit !== component.unit) {
                        throw new Error(`Unit mismatch for ${rawMat.name}. Expected ${rawMat.baseUnit}, got ${component.unit}`);
                    }
                    docs.push(new this.ledgerModel({
                        rawMaterialId: component.rawMaterialId,
                        rawMaterialName: component.rawMaterialName || rawMat.name,
                        restaurantId: dto.restaurantId,
                        outletId: dto.outletId,
                        transactionType: 'SALE_CONSUMPTION',
                        quantityChange: -consumedQty,
                        unit: rawMat.baseUnit || component.unit,
                        referenceType: 'ORDER',
                        referenceId: orderId,
                        remarks: 'Auto consumption on order completion',
                    }));
                }
            }
            const created = await this.ledgerModel.insertMany(docs, {
                session,
            });
            await session.commitTransaction();
            session.endSession();
            return { ledgerEntryIds: created.map((c) => c._id.toString()) };
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async costSnapshot(dto, internalToken) {
        this.assertInternalToken(internalToken);
        const materials = await this.rawMaterialModel
            .find({ _id: { $in: dto.rawMaterialIds } })
            .select({ averageCost: 1 })
            .lean()
            .exec();
        const map = {};
        materials.forEach((mat) => {
            var _a;
            map[mat._id.toString()] = { averageCost: (_a = mat.averageCost) !== null && _a !== void 0 ? _a : 0 };
        });
        return map;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_ledger_schema_1.InventoryLedger.name)),
    __param(1, (0, mongoose_1.InjectModel)(raw_material_schema_1.RawMaterial.name)),
    __param(2, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Connection])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map