import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { RawMaterial, RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { LowStockAlertService } from 'src/low-stock-alert/low-stock-alert.service';
import { AdjustmentDto } from './dto/adjustment.dto';
import { OpeningBalanceDto } from './dto/opening-balance.dto';
import {
  InventoryLedger,
  InventoryLedgerDocument,
  InventoryTransactionType,
  InventoryReferenceType,
} from './inventory-ledger.schema';

@Injectable()
export class InventoryLedgerService {
  constructor(
    @InjectModel(InventoryLedger.name)
    private readonly ledgerModel: Model<InventoryLedgerDocument>,
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
    private readonly lowStockAlertService: LowStockAlertService,
  ) {}

  async createOpeningBalance(dto: OpeningBalanceDto, userId: string): Promise<InventoryLedger> {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Opening balance quantity must be greater than 0');
    }

    const rawMaterial = await this.getActiveRawMaterial(dto.rawMaterialId);

    const existingOpening = await this.ledgerModel.exists({
      rawMaterialId: rawMaterial._id,
      outletId: rawMaterial.outletId,
      transactionType: InventoryTransactionType.OPENING_BALANCE,
    });

    if (existingOpening) {
      throw new BadRequestException('Opening balance already exists for this raw material and outlet');
    }

    const entry = new this.ledgerModel({
      restaurantId: rawMaterial.restaurantId,
      outletId: rawMaterial.outletId,
      rawMaterialId: rawMaterial._id,
      transactionType: InventoryTransactionType.OPENING_BALANCE,
      quantityChange: dto.quantity, // Opening balance is always positive
      unit: rawMaterial.baseUnit as BaseUnitEnum,
      referenceType: InventoryReferenceType.ADJUSTMENT,
      remarks: dto.remarks,
      createdByUserId: userId,
    });

    const saved = await entry.save();
    await this.lowStockAlertService.checkAfterDelta(
      rawMaterial._id as Types.ObjectId,
      rawMaterial.outletId,
      rawMaterial.restaurantId,
      dto.quantity,
    );
    return saved;
  }

  async createAdjustment(dto: AdjustmentDto, userId: string): Promise<InventoryLedger> {
    if (dto.quantityChange === 0) {
      throw new BadRequestException('quantityChange cannot be zero');
    }

    const rawMaterial = await this.getActiveRawMaterial(dto.rawMaterialId);

    const entry = new this.ledgerModel({
      restaurantId: rawMaterial.restaurantId,
      outletId: rawMaterial.outletId,
      rawMaterialId: rawMaterial._id,
      transactionType: InventoryTransactionType.ADJUSTMENT,
      quantityChange: dto.quantityChange,
      unit: rawMaterial.baseUnit as BaseUnitEnum,
      referenceType: InventoryReferenceType.ADJUSTMENT,
      remarks: dto.remarks,
      createdByUserId: userId,
    });

    const saved = await entry.save();
    await this.lowStockAlertService.checkAfterDelta(
      rawMaterial._id as Types.ObjectId,
      rawMaterial.outletId,
      rawMaterial.restaurantId,
      dto.quantityChange,
    );
    return saved;
  }

  async findEntries(rawMaterialId: string, outletId: string): Promise<InventoryLedger[]> {
    const rawMaterial = await this.getRawMaterialOrThrow(rawMaterialId);
    if (rawMaterial.outletId !== outletId) {
      throw new ForbiddenException('Raw material does not belong to the requested outlet');
    }

    return this.ledgerModel
      .find({ rawMaterialId: rawMaterial._id, outletId })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }

  async getCurrentStock(rawMaterialId: string, outletId: string): Promise<{
    rawMaterialId: string;
    outletId: string;
    restaurantId: string;
    unit: BaseUnitEnum;
    stock: number;
  }> {
    const rawMaterial = await this.getRawMaterialOrThrow(rawMaterialId);
    if (rawMaterial.outletId !== outletId) {
      throw new ForbiddenException('Raw material does not belong to the requested outlet');
    }

    const result = await this.ledgerModel.aggregate([
      {
        $match: {
          rawMaterialId: rawMaterial._id,
          outletId,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantityChange' },
        },
      },
    ]);

    const stock = result.length ? result[0].total : 0;

    return {
      rawMaterialId: rawMaterial._id.toString(),
      outletId,
      restaurantId: rawMaterial.restaurantId,
      unit: rawMaterial.baseUnit as BaseUnitEnum,
      stock,
    };
  }

  private async getActiveRawMaterial(rawMaterialId: string): Promise<RawMaterialDocument> {
    const material = await this.getRawMaterialOrThrow(rawMaterialId);
    if (!material.isActive) {
      throw new BadRequestException('Raw material is inactive');
    }
    return material;
  }

  private async getRawMaterialOrThrow(rawMaterialId: string): Promise<RawMaterialDocument> {
    if (!Types.ObjectId.isValid(rawMaterialId)) {
      throw new BadRequestException('Invalid rawMaterialId');
    }

    const material = await this.rawMaterialModel.findById(rawMaterialId).lean();
    if (!material) {
      throw new NotFoundException('Raw material not found');
    }
    return material as RawMaterialDocument;
  }
}

