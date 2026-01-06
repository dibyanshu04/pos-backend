import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { convertToBaseUnit } from 'src/common/units/unit-conversion.util';
import { validateUnitCompatibility } from 'src/common/units/unit-validation.util';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { PurchaseUnitEnum } from 'src/common/units/purchase-unit.enum';
import { InventoryLedger, InventoryLedgerDocument, InventoryReferenceType, InventoryTransactionType } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterial, RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { Vendor, VendorDocument } from 'src/vendor/vendor.schema';
import { LowStockAlertService } from 'src/low-stock-alert/low-stock-alert.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { Grn, GrnDocument } from './grn.schema';

@Injectable()
export class GrnService {
  constructor(
    @InjectModel(Grn.name)
    private readonly grnModel: Model<GrnDocument>,
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
    @InjectModel(InventoryLedger.name)
    private readonly ledgerModel: Model<InventoryLedgerDocument>,
    private readonly lowStockAlertService: LowStockAlertService,
  ) {}

  async createGrn(dto: CreateGrnDto, userId: string): Promise<Grn> {
    const session = await this.grnModel.db.startSession();
    session.startTransaction();
    try {
      const vendor = await this.vendorModel
        .findOne({ _id: dto.vendorId, outletId: dto.outletId })
        .session(session)
        .lean();
      if (!vendor) {
        throw new NotFoundException('Vendor not found for outlet');
      }
      if (!vendor.isActive) {
        throw new BadRequestException('Vendor is inactive');
      }

      if (dto.invoiceNumber) {
        const duplicate = await this.grnModel
          .findOne({
            outletId: dto.outletId,
            invoiceNumber: dto.invoiceNumber,
          })
          .session(session)
          .lean();
        if (duplicate) {
          throw new ConflictException('GRN with this invoice number already exists for this outlet');
        }
      }

      if (!dto.items?.length) {
        throw new BadRequestException('At least one GRN item is required');
      }

      const grnItems = [];
      const ledgerEntries = [];
      let totalPurchaseCost = 0;
      const existingStockMap = new Map<string, number>();
      const seenRawMaterials = new Set<string>();

      for (const item of dto.items) {
        if (item.purchaseQuantity <= 0) {
          throw new BadRequestException('purchaseQuantity must be greater than 0');
        }
        if (item.unitCost <= 0) {
          throw new BadRequestException('unitCost must be greater than 0');
        }

        const rm = await this.rawMaterialModel.findById(item.rawMaterialId).session(session).lean();
        if (!rm) {
          throw new NotFoundException('Raw material not found');
        }
        if (!rm.isActive) {
          throw new BadRequestException('Raw material is inactive');
        }
        if (rm.outletId !== dto.outletId) {
          throw new BadRequestException('Raw material does not belong to the outlet');
        }

        if (seenRawMaterials.has(rm._id.toString())) {
          throw new BadRequestException('Duplicate rawMaterialId in GRN items');
        }
        seenRawMaterials.add(rm._id.toString());

        validateUnitCompatibility(rm.purchaseUnit as PurchaseUnitEnum, rm.baseUnit as BaseUnitEnum);

        if (!existingStockMap.has(rm._id.toString())) {
          const existingStockAgg = await this.ledgerModel
            .aggregate([
              { $match: { rawMaterialId: rm._id, outletId: rm.outletId } },
              { $group: { _id: null, total: { $sum: '$quantityChange' } } },
            ])
            .session(session);
          const existingQty = existingStockAgg.length ? existingStockAgg[0].total : 0;
          existingStockMap.set(rm._id.toString(), existingQty);
        }

        const baseQuantity = convertToBaseUnit(
          item.purchaseQuantity,
          rm.purchaseUnit as PurchaseUnitEnum,
          rm.baseUnit as BaseUnitEnum,
          rm.conversionFactor,
        );

        const unitCostBase = item.unitCost / rm.conversionFactor; // cost per base unit
        const totalCost = baseQuantity * unitCostBase;

        grnItems.push({
          rawMaterialId: rm._id as Types.ObjectId,
          rawMaterialName: rm.name,
          purchaseQuantity: item.purchaseQuantity,
          purchaseUnit: rm.purchaseUnit,
          baseQuantity,
          baseUnit: rm.baseUnit,
          unitCost: unitCostBase,
          totalCost,
        });

        ledgerEntries.push({
          restaurantId: rm.restaurantId,
          outletId: rm.outletId,
          rawMaterialId: rm._id as Types.ObjectId,
          transactionType: InventoryTransactionType.PURCHASE,
          quantityChange: baseQuantity,
          unit: rm.baseUnit,
          referenceType: InventoryReferenceType.GRN,
          referenceId: undefined, // set after grn created
          remarks: dto.invoiceNumber ? `GRN ${dto.invoiceNumber}` : 'GRN',
          createdByUserId: userId,
          createdAt: new Date(),
        });

        totalPurchaseCost += totalCost;
      }

      const [grn] = await this.grnModel.create(
        [
          {
            restaurantId: dto.restaurantId,
            outletId: dto.outletId,
            vendorId: dto.vendorId,
            vendorName: vendor.name,
            invoiceNumber: dto.invoiceNumber,
            invoiceDate: dto.invoiceDate,
            items: grnItems,
            totalPurchaseCost,
            createdByUserId: userId,
          },
        ],
        { session },
      );

      // Attach referenceId now that grn exists
      const ledgerEntriesWithRef = ledgerEntries.map((entry) => ({
        ...entry,
        referenceId: grn._id,
      }));

      await this.ledgerModel.insertMany(ledgerEntriesWithRef, { session });

      // Update costing per raw material (weighted average) inside the same session
      for (const item of grnItems) {
        await this.updateRawMaterialCosting(
          session,
          item.rawMaterialId,
          existingStockMap.get(item.rawMaterialId.toString()) ?? 0,
          item.baseQuantity,
          item.unitCost,
          userId,
        );
        await this.lowStockAlertService.checkAfterDelta(
          item.rawMaterialId as Types.ObjectId,
          dto.outletId,
          dto.restaurantId,
          item.baseQuantity,
          session,
        );
      }

      await session.commitTransaction();
      return grn.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(outletId: string): Promise<Grn[]> {
    if (!outletId) {
      throw new BadRequestException('outletId is required');
    }
    return this.grnModel.find({ outletId }).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string): Promise<Grn> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid grn id');
    }
    const grn = await this.grnModel.findById(id).lean().exec();
    if (!grn) {
      throw new NotFoundException('GRN not found');
    }
    return grn;
  }

  private async updateRawMaterialCosting(
    session: any,
    rawMaterialId: Types.ObjectId,
    existingQtyBefore: number,
    newBaseQty: number,
    newUnitCostBase: number,
    userId: string,
  ) {
    const rawMaterial = await this.rawMaterialModel.findById(rawMaterialId).session(session);
    if (!rawMaterial) {
      throw new NotFoundException('Raw material not found during costing update');
    }

    const safeExistingQty = existingQtyBefore > 0 ? existingQtyBefore : 0;
    const existingAvg = rawMaterial.costing?.averageCost ?? 0;
    const existingValue = safeExistingQty * existingAvg;

    const newValue = newBaseQty * newUnitCostBase;
    const combinedQty = safeExistingQty + newBaseQty;
    const newAverageCost = combinedQty > 0 ? (existingValue + newValue) / combinedQty : newUnitCostBase;

    rawMaterial.costing = {
      averageCost: newAverageCost,
      lastPurchaseCost: newUnitCostBase,
    };
    rawMaterial.updatedByUserId = userId;
    await rawMaterial.save({ session });
  }
}

