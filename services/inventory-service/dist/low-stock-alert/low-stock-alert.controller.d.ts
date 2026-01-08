import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { LowStockAlertService } from './low-stock-alert.service';
export declare class LowStockAlertController {
    private readonly lowStockAlertService;
    constructor(lowStockAlertService: LowStockAlertService);
    getActive(outletId: string): Promise<SuccessResponseDto<any>>;
    getHistory(outletId: string, rawMaterialId?: string): Promise<SuccessResponseDto<any>>;
}
