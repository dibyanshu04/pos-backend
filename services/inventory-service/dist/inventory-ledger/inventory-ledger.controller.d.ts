import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { AdjustmentDto } from './dto/adjustment.dto';
import { OpeningBalanceDto } from './dto/opening-balance.dto';
import { InventoryLedgerService } from './inventory-ledger.service';
export declare class InventoryLedgerController {
    private readonly ledgerService;
    constructor(ledgerService: InventoryLedgerService);
    createOpeningBalance(dto: OpeningBalanceDto, req: any): Promise<SuccessResponseDto<any>>;
    createAdjustment(dto: AdjustmentDto, req: any): Promise<SuccessResponseDto<any>>;
    findEntries(rawMaterialId: string, outletId: string): Promise<SuccessResponseDto<any[]>>;
    getCurrentStock(rawMaterialId: string, outletId: string): Promise<SuccessResponseDto<any>>;
}
