"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawMaterialModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const low_stock_alert_module_1 = require("../low-stock-alert/low-stock-alert.module");
const raw_material_controller_1 = require("./raw-material.controller");
const raw_material_service_1 = require("./raw-material.service");
const raw_material_schema_1 = require("./raw-material.schema");
let RawMaterialModule = class RawMaterialModule {
};
exports.RawMaterialModule = RawMaterialModule;
exports.RawMaterialModule = RawMaterialModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: raw_material_schema_1.RawMaterial.name, schema: raw_material_schema_1.RawMaterialSchema },
            ]),
            low_stock_alert_module_1.LowStockAlertModule,
        ],
        controllers: [raw_material_controller_1.RawMaterialController],
        providers: [raw_material_service_1.RawMaterialService],
        exports: [raw_material_service_1.RawMaterialService],
    })
], RawMaterialModule);
//# sourceMappingURL=raw-material.module.js.map