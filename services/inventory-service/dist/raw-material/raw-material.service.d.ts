import { Model } from 'mongoose';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { UpdateRawMaterialStatusDto } from './dto/update-raw-material-status.dto';
import { LowStockAlertService } from 'src/low-stock-alert/low-stock-alert.service';
import { RawMaterial, RawMaterialDocument } from './raw-material.schema';
export declare class RawMaterialService {
    private readonly rawMaterialModel;
    private readonly lowStockAlertService;
    constructor(rawMaterialModel: Model<RawMaterialDocument>, lowStockAlertService: LowStockAlertService);
    create(createDto: CreateRawMaterialDto): Promise<RawMaterial>;
    findAll(outletId: string): Promise<RawMaterial[]>;
    findOne(id: string): Promise<RawMaterial>;
    update(id: string, updateDto: UpdateRawMaterialDto): Promise<RawMaterial>;
    updateStatus(id: string, statusDto: UpdateRawMaterialStatusDto): Promise<RawMaterial>;
    updateLowStockThreshold(id: string, lowStockThreshold: number): Promise<RawMaterial>;
    private ensureUniquePerOutlet;
    private normalizeCosting;
    private validateUnits;
}
