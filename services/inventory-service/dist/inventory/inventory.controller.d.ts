import { InventoryService } from './inventory.service';
import { ConsumeInventoryDto } from './dto/consume-inventory.dto';
import { CostSnapshotDto } from './dto/cost-snapshot.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    consume(body: ConsumeInventoryDto, internalToken?: string): Promise<{
        ledgerEntryIds?: string[];
        status: string;
    }>;
    costSnapshot(body: CostSnapshotDto, internalToken?: string): Promise<Record<string, {
        averageCost: number;
    }>>;
}
