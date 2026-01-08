"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryLedgerModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const low_stock_alert_module_1 = require("../low-stock-alert/low-stock-alert.module");
const inventory_ledger_controller_1 = require("./inventory-ledger.controller");
const inventory_ledger_service_1 = require("./inventory-ledger.service");
const inventory_ledger_schema_1 = require("./inventory-ledger.schema");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
let InventoryLedgerModule = class InventoryLedgerModule {
};
exports.InventoryLedgerModule = InventoryLedgerModule;
exports.InventoryLedgerModule = InventoryLedgerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: inventory_ledger_schema_1.InventoryLedger.name, schema: inventory_ledger_schema_1.InventoryLedgerSchema },
                { name: raw_material_schema_1.RawMaterial.name, schema: raw_material_schema_1.RawMaterialSchema },
            ]),
            low_stock_alert_module_1.LowStockAlertModule,
        ],
        controllers: [inventory_ledger_controller_1.InventoryLedgerController],
        providers: [inventory_ledger_service_1.InventoryLedgerService],
        exports: [inventory_ledger_service_1.InventoryLedgerService],
    })
], InventoryLedgerModule);
//# sourceMappingURL=inventory-ledger.module.js.map