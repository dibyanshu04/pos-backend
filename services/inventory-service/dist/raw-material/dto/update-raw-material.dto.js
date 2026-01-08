"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRawMaterialDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const create_raw_material_dto_1 = require("./create-raw-material.dto");
class UpdateRawMaterialDto extends (0, swagger_1.PartialType)(create_raw_material_dto_1.CreateRawMaterialDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateRawMaterialDto = UpdateRawMaterialDto;
//# sourceMappingURL=update-raw-material.dto.js.map