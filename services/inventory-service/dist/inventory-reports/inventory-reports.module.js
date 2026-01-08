"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryReportsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const inventory_ledger_schema_1 = require("../inventory-ledger/inventory-ledger.schema");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
const inventory_reports_controller_1 = require("./inventory-reports.controller");
const inventory_reports_service_1 = require("./inventory-reports.service");
let InventoryReportsModule = class InventoryReportsModule {
};
exports.InventoryReportsModule = InventoryReportsModule;
exports.InventoryReportsModule = InventoryReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: inventory_ledger_schema_1.InventoryLedger.name, schema: inventory_ledger_schema_1.InventoryLedgerSchema },
                { name: raw_material_schema_1.RawMaterial.name, schema: raw_material_schema_1.RawMaterialSchema },
            ]),
        ],
        controllers: [inventory_reports_controller_1.InventoryReportsController],
        providers: [inventory_reports_service_1.InventoryReportsService],
    })
], InventoryReportsModule);
//# sourceMappingURL=inventory-reports.module.js.map