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
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const vendor_schema_1 = require("./vendor.schema");
let VendorService = class VendorService {
    constructor(vendorModel) {
        this.vendorModel = vendorModel;
    }
    async create(dto) {
        const exists = await this.vendorModel.exists({
            outletId: dto.outletId,
            name: dto.name.trim(),
        });
        if (exists) {
            throw new common_1.ConflictException('Vendor with this name already exists for the outlet');
        }
        const vendor = new this.vendorModel({
            restaurantId: dto.restaurantId,
            outletId: dto.outletId,
            name: dto.name.trim(),
            phone: dto.phone,
            email: dto.email,
            gstin: dto.gstin,
            isActive: true,
        });
        return vendor.save();
    }
    async findAll(outletId) {
        if (!outletId) {
            throw new common_1.BadRequestException('outletId is required');
        }
        return this.vendorModel.find({ outletId }).sort({ name: 1 }).lean().exec();
    }
    async updateStatus(id, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid vendor id');
        }
        const vendor = await this.vendorModel.findById(id).exec();
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        vendor.isActive = dto.isActive;
        await vendor.save();
        return vendor.toObject();
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VendorService);
//# sourceMappingURL=vendor.service.js.map