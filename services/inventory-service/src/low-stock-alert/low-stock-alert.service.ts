import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InventoryLedger, InventoryLedgerDocument } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterial, RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { LowStockAlert, LowStockAlertDocument } from './low-stock-alert.schema';

@Injectable()
export class LowStockAlertService {
  constructor(
    @InjectModel(LowStockAlert.name)
    private readonly alertModel: Model<LowStockAlertDocument>,
    @InjectModel(InventoryLedger.name)
    private readonly ledgerModel: Model<InventoryLedgerDocument>,
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
  ) {}

  /**
   * Check threshold after a known delta (quantityChange just applied to ledger).
   * previousStock = currentStock - delta. Only trigger when crossing from above to at/below threshold.
   * Also auto-resolve if recovered.
   */
  async checkAfterDelta(
    rawMaterialId: Types.ObjectId,
    outletId: string,
    restaurantId: string,
    delta: number,
    session?: any,
  ) {
    const rm = await this.rawMaterialModel.findById(rawMaterialId).session(session);
    if (!rm || !rm.isActive) return;
    if (rm.outletId !== outletId) return;

    const threshold = rm.lowStockThreshold;
    if (threshold === undefined || threshold === null) {
      // No threshold -> resolve any open alert if exists
      await this.resolveIfRecovered(rawMaterialId, outletId, Number.POSITIVE_INFINITY, session);
      return;
    }
    if (threshold < 0) {
      throw new BadRequestException('lowStockThreshold cannot be negative');
    }

    const currentStock = await this.getCurrentStock(rawMaterialId, outletId, session);
    const previousStock = currentStock - delta;

    // Resolve if recovered
    if (currentStock > threshold) {
      await this.resolveIfRecovered(rawMaterialId, outletId, currentStock, session);
      return;
    }

    // Trigger only on crossing
    if (previousStock > threshold && currentStock <= threshold) {
      await this.createIfNotExists(rawMaterialId, rm.name, restaurantId, outletId, threshold, currentStock, session);
    }
  }

  /**
   * Reconcile without a known delta (e.g., threshold change). If already below/equal and no open alert, create once.
   * Resolve if above threshold.
   */
  async reconcile(rawMaterialId: Types.ObjectId, outletId: string, restaurantId: string, session?: any) {
    const rm = await this.rawMaterialModel.findById(rawMaterialId).session(session);
    if (!rm || !rm.isActive) return;
    if (rm.outletId !== outletId) return;
    const threshold = rm.lowStockThreshold;
    if (threshold === undefined || threshold === null) {
      await this.resolveIfRecovered(rawMaterialId, outletId, Number.POSITIVE_INFINITY, session);
      return;
    }
    if (threshold < 0) {
      throw new BadRequestException('lowStockThreshold cannot be negative');
    }

    const currentStock = await this.getCurrentStock(rawMaterialId, outletId, session);
    if (currentStock > threshold) {
      await this.resolveIfRecovered(rawMaterialId, outletId, currentStock, session);
    } else {
      const open = await this.alertModel
        .findOne({ rawMaterialId, outletId, isResolved: false })
        .session(session)
        .lean();
      if (!open) {
        await this.createIfNotExists(rawMaterialId, rm.name, restaurantId, outletId, threshold, currentStock, session);
      }
    }
  }

  async getActiveAlerts(outletId: string) {
    return this.alertModel
      .find({ outletId, isResolved: false })
      .sort({ triggeredAt: -1 })
      .lean()
      .exec();
  }

  async getAlertHistory(outletId: string, rawMaterialId?: string) {
    const filter: any = { outletId };
    if (rawMaterialId) {
      filter.rawMaterialId = new Types.ObjectId(rawMaterialId);
    }
    return this.alertModel
      .find(filter)
      .sort({ triggeredAt: -1 })
      .lean()
      .exec();
  }

  private async createIfNotExists(
    rawMaterialId: Types.ObjectId,
    rawMaterialName: string,
    restaurantId: string,
    outletId: string,
    threshold: number,
    stockAtTrigger: number,
    session?: any,
  ) {
    const existing = await this.alertModel
      .findOne({ rawMaterialId, outletId, isResolved: false })
      .session(session)
      .lean();
    if (existing) return;

    await this.alertModel.create(
      [
        {
          restaurantId,
          outletId,
          rawMaterialId,
          rawMaterialName,
          threshold,
          stockAtTrigger,
          isResolved: false,
        },
      ],
      { session },
    );
  }

  private async resolveIfRecovered(
    rawMaterialId: Types.ObjectId,
    outletId: string,
    currentStock: number,
    session?: any,
  ) {
    await this.alertModel
      .updateMany(
        { rawMaterialId, outletId, isResolved: false },
        { $set: { isResolved: true, resolvedAt: new Date(), stockAtTrigger: currentStock } },
        { session },
      )
      .exec();
  }

  private async getCurrentStock(rawMaterialId: Types.ObjectId, outletId: string, session?: any): Promise<number> {
    const result = await this.ledgerModel
      .aggregate([
        { $match: { rawMaterialId, outletId } },
        { $group: { _id: null, total: { $sum: '$quantityChange' } } },
      ])
      .session(session || undefined);
    return result.length ? result[0].total : 0;
  }
}

