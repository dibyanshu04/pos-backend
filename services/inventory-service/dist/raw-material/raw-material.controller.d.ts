import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { RawMaterialService } from './raw-material.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { UpdateRawMaterialStatusDto } from './dto/update-raw-material-status.dto';
export declare class RawMaterialController {
    private readonly rawMaterialService;
    constructor(rawMaterialService: RawMaterialService);
    create(createDto: CreateRawMaterialDto): Promise<SuccessResponseDto<any>>;
    findAll(outletId: string): Promise<SuccessResponseDto<any[]>>;
    findOne(id: string): Promise<SuccessResponseDto<any>>;
    update(id: string, updateDto: UpdateRawMaterialDto): Promise<SuccessResponseDto<any>>;
    updateStatus(id: string, statusDto: UpdateRawMaterialStatusDto): Promise<SuccessResponseDto<any>>;
    updateLowStockThreshold(id: string, body: {
        lowStockThreshold: number;
    }): Promise<SuccessResponseDto<any>>;
}
