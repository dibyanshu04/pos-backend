import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { VendorService } from './vendor.service';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    create(dto: CreateVendorDto): Promise<SuccessResponseDto<any>>;
    findAll(outletId: string): Promise<SuccessResponseDto<any[]>>;
    updateStatus(id: string, dto: UpdateVendorStatusDto): Promise<SuccessResponseDto<any>>;
}
