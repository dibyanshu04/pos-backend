import { Model } from 'mongoose';
import { InventoryLedgerDocument } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterialDocument } from 'src/raw-material/raw-material.schema';
interface DateRange {
    from?: Date;
    to?: Date;
}
export declare class InventoryReportsService {
    private readonly ledgerModel;
    private readonly rawMaterialModel;
    constructor(ledgerModel: Model<InventoryLedgerDocument>, rawMaterialModel: Model<RawMaterialDocument>);
    currentStock(outletId: string): Promise<any[]>;
    consumption(outletId: string, range: DateRange): Promise<any[]>;
    wastage(outletId: string, range: DateRange): Promise<any[]>;
    variance(outletId: string, range: DateRange): Promise<{
        rawMaterialId: string;
        rawMaterialName: any;
        unit: any;
        openingStock: number;
        purchased: number;
        consumed: number;
        wasted: number;
        adjustments: number;
        closingStock: number;
        variance: number;
    }[]>;
    private applyDateFilter;
    private aggregateSumByMaterial;
    private aggregateSumsByType;
    validateDateRange(from?: string, to?: string): {
        from: Date;
        to: Date;
    };
}
export {};
