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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpeningBalanceDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class OpeningBalanceDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { rawMaterialId: { required: true, type: () => String }, quantity: { required: true, type: () => Number, minimum: 0.0001 }, remarks: { required: false, type: () => String } };
    }
}
exports.OpeningBalanceDto = OpeningBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Raw material ID (must be active and outlet-scoped)',
        example: '64f0c9a2b7d3c2f1a1234567',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OpeningBalanceDto.prototype, "rawMaterialId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Opening quantity in purchase unit converted to base unit via conversionFactor; must be positive.',
        example: 5000,
        minimum: 0.0001,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], OpeningBalanceDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Remarks for audit trail',
        example: 'Initial stock on migration day',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpeningBalanceDto.prototype, "remarks", void 0);
//# sourceMappingURL=opening-balance.dto.js.map