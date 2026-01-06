import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { Vendor, VendorDocument } from './vendor.schema';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
  ) {}

  async create(dto: CreateVendorDto): Promise<Vendor> {
    const exists = await this.vendorModel.exists({
      outletId: dto.outletId,
      name: dto.name.trim(),
    });
    if (exists) {
      throw new ConflictException('Vendor with this name already exists for the outlet');
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

  async findAll(outletId: string): Promise<Vendor[]> {
    if (!outletId) {
      throw new BadRequestException('outletId is required');
    }
    return this.vendorModel.find({ outletId }).sort({ name: 1 }).lean().exec();
  }

  async updateStatus(id: string, dto: UpdateVendorStatusDto): Promise<Vendor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor id');
    }
    const vendor = await this.vendorModel.findById(id).exec();
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    vendor.isActive = dto.isActive;
    await vendor.save();
    return vendor.toObject();
  }
}

