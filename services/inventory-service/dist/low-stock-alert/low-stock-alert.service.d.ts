import { Model, Types } from 'mongoose';
import { InventoryLedgerDocument } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { LowStockAlert, LowStockAlertDocument } from './low-stock-alert.schema';
export declare class LowStockAlertService {
    private readonly alertModel;
    private readonly ledgerModel;
    private readonly rawMaterialModel;
    constructor(alertModel: Model<LowStockAlertDocument>, ledgerModel: Model<InventoryLedgerDocument>, rawMaterialModel: Model<RawMaterialDocument>);
    checkAfterDelta(rawMaterialId: Types.ObjectId, outletId: string, restaurantId: string, delta: number, session?: any): Promise<void>;
    reconcile(rawMaterialId: Types.ObjectId, outletId: string, restaurantId: string, session?: any): Promise<void>;
    getActiveAlerts(outletId: string): Promise<(LowStockAlert & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getAlertHistory(outletId: string, rawMaterialId?: string): Promise<(LowStockAlert & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    private createIfNotExists;
    private resolveIfRecovered;
    private getCurrentStock;
}
