import { Model } from 'mongoose';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { Vendor, VendorDocument } from './vendor.schema';
export declare class VendorService {
    private readonly vendorModel;
    constructor(vendorModel: Model<VendorDocument>);
    create(dto: CreateVendorDto): Promise<Vendor>;
    findAll(outletId: string): Promise<Vendor[]>;
    updateStatus(id: string, dto: UpdateVendorStatusDto): Promise<Vendor>;
}
