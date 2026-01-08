"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const menu_service_client_1 = require("../common/clients/menu-service.client");
const recipe_controller_1 = require("./recipe.controller");
const recipe_service_1 = require("./recipe.service");
const recipe_schema_1 = require("./recipe.schema");
const raw_material_schema_1 = require("../raw-material/raw-material.schema");
let RecipeModule = class RecipeModule {
};
exports.RecipeModule = RecipeModule;
exports.RecipeModule = RecipeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: recipe_schema_1.Recipe.name, schema: recipe_schema_1.RecipeSchema },
                { name: raw_material_schema_1.RawMaterial.name, schema: raw_material_schema_1.RawMaterialSchema },
            ]),
        ],
        controllers: [recipe_controller_1.RecipeController],
        providers: [recipe_service_1.RecipeService, menu_service_client_1.MenuServiceClient],
        exports: [recipe_service_1.RecipeService],
    })
], RecipeModule);
//# sourceMappingURL=recipe.module.js.map