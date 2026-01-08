"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrnModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const inventory_ledger_schema_1 = require("../inventory-ledger/inventory-ledger.schema");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
const vendor_schema_1 = require("../vendor/vendor.schema");
const low_stock_alert_module_1 = require("../low-stock-alert/low-stock-alert.module");
const grn_controller_1 = require("./grn.controller");
const grn_service_1 = require("./grn.service");
const grn_schema_1 = require("./grn.schema");
let GrnModule = class GrnModule {
};
exports.GrnModule = GrnModule;
exports.GrnModule = GrnModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: grn_schema_1.Grn.name, schema: grn_schema_1.GrnSchema },
                { name: vendor_schema_1.Vendor.name, schema: vendor_schema_1.VendorSchema },
                { name: raw_material_schema_1.RawMaterial.name, schema: raw_material_schema_1.RawMaterialSchema },
                { name: inventory_ledger_schema_1.InventoryLedger.name, schema: inventory_ledger_schema_1.InventoryLedgerSchema },
            ]),
            low_stock_alert_module_1.LowStockAlertModule,
        ],
        controllers: [grn_controller_1.GrnController],
        providers: [grn_service_1.GrnService],
    })
], GrnModule);
//# sourceMappingURL=grn.module.js.map