import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ConsumeInventoryDto } from './dto/consume-inventory.dto';
import { CostSnapshotDto } from './dto/cost-snapshot.dto';
import {
  InventoryLedger,
  InventoryLedgerDocument,
} from './schemas/inventory-ledger.schema';
import {
  RawMaterial,
  RawMaterialDocument,
} from './schemas/raw-material.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryLedger.name)
    private ledgerModel: Model<InventoryLedgerDocument>,
    @InjectModel(RawMaterial.name)
    private rawMaterialModel: Model<RawMaterialDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private assertInternalToken(headerToken?: string) {
    const expected = process.env.INVENTORY_INTERNAL_TOKEN || '';
    if (expected && headerToken !== expected) {
      throw new UnauthorizedException('Unauthorized internal access');
    }
  }

  async consumeInventory(
    dto: ConsumeInventoryDto,
    internalToken?: string,
  ): Promise<{ ledgerEntryIds?: string[] }> {
    this.assertInternalToken(internalToken);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { orderId } = dto;

      const existing = await this.ledgerModel
        .findOne({
          referenceType: 'ORDER',
          referenceId: orderId,
          transactionType: 'SALE_CONSUMPTION',
        })
        .session(session)
        .exec();

      if (existing) {
        await session.abortTransaction();
        session.endSession();
        return { ledgerEntryIds: [] };
      }

      const docs: InventoryLedger[] = [];

      for (const item of dto.items) {
        for (const component of item.recipeSnapshot) {
          const consumedQty =
            item.quantityOrdered * component.quantityPerUnit;
          if (!Number.isFinite(consumedQty) || consumedQty <= 0) {
            throw new Error(
              `Invalid consumption quantity for raw material ${component.rawMaterialId}`,
            );
          }

          const rawMat = await this.rawMaterialModel
            .findById(component.rawMaterialId)
            .session(session)
            .exec();

          if (!rawMat) {
            throw new Error(
              `Raw material ${component.rawMaterialId} not found`,
            );
          }
          if (rawMat.isActive === false) {
            throw new Error(`Raw material ${rawMat.name} is inactive`);
          }
          if (rawMat.baseUnit && rawMat.baseUnit !== component.unit) {
            throw new Error(
              `Unit mismatch for ${rawMat.name}. Expected ${rawMat.baseUnit}, got ${component.unit}`,
            );
          }

          docs.push(
            new this.ledgerModel({
              rawMaterialId: component.rawMaterialId,
              rawMaterialName: component.rawMaterialName || rawMat.name,
              restaurantId: dto.restaurantId,
              outletId: dto.outletId,
              transactionType: 'SALE_CONSUMPTION',
              quantityChange: -consumedQty,
              unit: rawMat.baseUnit || component.unit,
              referenceType: 'ORDER',
              referenceId: orderId,
              remarks: 'Auto consumption on order completion',
            }),
          );
        }
      }

      const created = await this.ledgerModel.insertMany(docs, {
        session,
      });
      await session.commitTransaction();
      session.endSession();

      return { ledgerEntryIds: created.map((c) => c._id.toString()) };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async costSnapshot(
    dto: CostSnapshotDto,
    internalToken?: string,
  ): Promise<Record<string, { averageCost: number }>> {
    this.assertInternalToken(internalToken);
    const materials = await this.rawMaterialModel
      .find({ _id: { $in: dto.rawMaterialIds } })
      .select({ averageCost: 1 })
      .lean()
      .exec();

    const map: Record<string, { averageCost: number }> = {};
    materials.forEach((mat) => {
      map[mat._id.toString()] = { averageCost: mat.averageCost ?? 0 };
    });
    return map;
  }
}

