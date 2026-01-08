import { Model } from 'mongoose';
import { InventoryLedgerDocument } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { VendorDocument } from 'src/vendor/vendor.schema';
import { LowStockAlertService } from 'src/low-stock-alert/low-stock-alert.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { Grn, GrnDocument } from './grn.schema';
export declare class GrnService {
    private readonly grnModel;
    private readonly vendorModel;
    private readonly rawMaterialModel;
    private readonly ledgerModel;
    private readonly lowStockAlertService;
    constructor(grnModel: Model<GrnDocument>, vendorModel: Model<VendorDocument>, rawMaterialModel: Model<RawMaterialDocument>, ledgerModel: Model<InventoryLedgerDocument>, lowStockAlertService: LowStockAlertService);
    createGrn(dto: CreateGrnDto, userId: string): Promise<Grn>;
    findAll(outletId: string): Promise<Grn[]>;
    findOne(id: string): Promise<Grn>;
    private updateRawMaterialCosting;
}
