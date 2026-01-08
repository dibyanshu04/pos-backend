import { Model } from 'mongoose';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { LowStockAlertService } from 'src/low-stock-alert/low-stock-alert.service';
import { AdjustmentDto } from './dto/adjustment.dto';
import { OpeningBalanceDto } from './dto/opening-balance.dto';
import { InventoryLedger, InventoryLedgerDocument } from './inventory-ledger.schema';
export declare class InventoryLedgerService {
    private readonly ledgerModel;
    private readonly rawMaterialModel;
    private readonly lowStockAlertService;
    constructor(ledgerModel: Model<InventoryLedgerDocument>, rawMaterialModel: Model<RawMaterialDocument>, lowStockAlertService: LowStockAlertService);
    createOpeningBalance(dto: OpeningBalanceDto, userId: string): Promise<InventoryLedger>;
    createAdjustment(dto: AdjustmentDto, userId: string): Promise<InventoryLedger>;
    findEntries(rawMaterialId: string, outletId: string): Promise<InventoryLedger[]>;
    getCurrentStock(rawMaterialId: string, outletId: string): Promise<{
        rawMaterialId: string;
        outletId: string;
        restaurantId: string;
        unit: BaseUnitEnum;
        stock: number;
    }>;
    private getActiveRawMaterial;
    private getRawMaterialOrThrow;
}
