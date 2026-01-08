import { Connection, Model } from 'mongoose';
import { ConsumeInventoryDto } from './dto/consume-inventory.dto';
import { CostSnapshotDto } from './dto/cost-snapshot.dto';
import { InventoryLedgerDocument } from './schemas/inventory-ledger.schema';
import { RawMaterialDocument } from './schemas/raw-material.schema';
export declare class InventoryService {
    private ledgerModel;
    private rawMaterialModel;
    private readonly connection;
    constructor(ledgerModel: Model<InventoryLedgerDocument>, rawMaterialModel: Model<RawMaterialDocument>, connection: Connection);
    private assertInternalToken;
    consumeInventory(dto: ConsumeInventoryDto, internalToken?: string): Promise<{
        ledgerEntryIds?: string[];
    }>;
    costSnapshot(dto: CostSnapshotDto, internalToken?: string): Promise<Record<string, {
        averageCost: number;
    }>>;
}
