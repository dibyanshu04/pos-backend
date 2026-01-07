import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InventoryLedger, InventoryLedgerDocument, InventoryTransactionType } from 'src/inventory-ledger/inventory-ledger.schema';
import { RawMaterial, RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { ReportQueryDto } from './dto/report-query.dto';

interface DateRange {
  from?: Date;
  to?: Date;
}

@Injectable()
export class InventoryReportsService {
  constructor(
    @InjectModel(InventoryLedger.name)
    private readonly ledgerModel: Model<InventoryLedgerDocument>,
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
  ) {}

  async currentStock(outletId: string) {
    const stock = await this.ledgerModel
      .aggregate([
        { $match: { outletId } },
        {
          $group: {
            _id: '$rawMaterialId',
            quantity: { $sum: '$quantityChange' },
          },
        },
        {
          $lookup: {
            from: 'rawmaterials',
            localField: '_id',
            foreignField: '_id',
            as: 'rm',
          },
        },
        { $unwind: '$rm' },
        {
          $project: {
            rawMaterialId: '$_id',
            rawMaterialName: '$rm.name',
            unit: '$rm.baseUnit',
            averageCost: '$rm.costing.averageCost',
            currentStock: '$quantity',
            stockValue: { $multiply: ['$quantity', '$rm.costing.averageCost'] },
          },
        },
        { $sort: { rawMaterialName: 1 } },
      ])
      .exec();

    return stock;
  }

  async consumption(outletId: string, range: DateRange) {
    const match: any = {
      outletId,
      transactionType: InventoryTransactionType.SALE_CONSUMPTION,
    };
    this.applyDateFilter(match, range);

    const rows = await this.ledgerModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$rawMaterialId',
            qty: { $sum: '$quantityChange' },
          },
        },
        {
          $lookup: {
            from: 'rawmaterials',
            localField: '_id',
            foreignField: '_id',
            as: 'rm',
          },
        },
        { $unwind: '$rm' },
        {
          $project: {
            rawMaterialId: '$_id',
            rawMaterialName: '$rm.name',
            unit: '$rm.baseUnit',
            consumedQuantity: { $abs: '$qty' },
            consumedValue: { $multiply: [{ $abs: '$qty' }, '$rm.costing.averageCost'] },
          },
        },
        { $sort: { rawMaterialName: 1 } },
      ])
      .exec();
    return rows;
  }

  async wastage(outletId: string, range: DateRange) {
    const match: any = {
      outletId,
      transactionType: InventoryTransactionType.WASTAGE,
    };
    this.applyDateFilter(match, range);

    const rows = await this.ledgerModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: { rawMaterialId: '$rawMaterialId', reason: '$remarks' },
            qty: { $sum: '$quantityChange' },
          },
        },
        {
          $group: {
            _id: '$_id.rawMaterialId',
            total: { $sum: '$qty' },
            reasons: {
              $push: {
                reason: { $ifNull: ['$_id.reason', 'UNSPECIFIED'] },
                qty: '$qty',
              },
            },
          },
        },
        {
          $lookup: {
            from: 'rawmaterials',
            localField: '_id',
            foreignField: '_id',
            as: 'rm',
          },
        },
        { $unwind: '$rm' },
        {
          $project: {
            rawMaterialId: '$_id',
            rawMaterialName: '$rm.name',
            unit: '$rm.baseUnit',
            wastedQuantity: { $abs: '$total' },
            reasonBreakup: {
              $arrayToObject: {
                $map: {
                  input: '$reasons',
                  as: 'r',
                  in: ['$$r.reason', { $abs: '$$r.qty' }],
                },
              },
            },
          },
        },
        { $sort: { rawMaterialName: 1 } },
      ])
      .exec();

    return rows;
  }

  async variance(outletId: string, range: DateRange) {
    const { from, to } = range;
    const fromDate = from ?? new Date(0);
    const toDate = to ?? new Date();

    const [openingRows, closingRows, inRangeRows] = await Promise.all([
      this.aggregateSumByMaterial(outletId, { to: fromDate, exclusiveEnd: true }),
      this.aggregateSumByMaterial(outletId, { to: toDate, inclusiveEnd: true }),
      this.aggregateSumsByType(outletId, fromDate, toDate),
    ]);

    const openingMap = new Map<string, number>();
    openingRows.forEach((r) => openingMap.set(r._id.toString(), r.total));

    const closingMap = new Map<string, number>();
    closingRows.forEach((r) => closingMap.set(r._id.toString(), r.total));

    const typeMap = new Map<
      string,
      {
        purchased: number;
        consumed: number;
        wasted: number;
        adjustments: number;
      }
    >();

    inRangeRows.forEach((r) => {
      const key = r._id.rawMaterialId.toString();
      const existing =
        typeMap.get(key) || { purchased: 0, consumed: 0, wasted: 0, adjustments: 0 };

      switch (r._id.transactionType) {
        case InventoryTransactionType.PURCHASE:
          existing.purchased += r.total;
          break;
        case InventoryTransactionType.SALE_CONSUMPTION:
          existing.consumed += Math.abs(r.total);
          break;
        case InventoryTransactionType.WASTAGE:
          existing.wasted += Math.abs(r.total);
          break;
        case InventoryTransactionType.ADJUSTMENT:
          existing.adjustments += r.total;
          break;
        default:
          break;
      }

      typeMap.set(key, existing);
    });

    // Collect all rawMaterialIds present in any map
    const idsSet = new Set<string>([
      ...openingMap.keys(),
      ...closingMap.keys(),
      ...typeMap.keys(),
    ]);

    const rawMaterials = await this.rawMaterialModel
      .find({ _id: { $in: Array.from(idsSet).map((id) => new Types.ObjectId(id)) } })
      .lean()
      .exec();
    const rmMap = new Map<string, any>();
    rawMaterials.forEach((rm) => rmMap.set(rm._id.toString(), rm));

    const results = Array.from(idsSet).map((id) => {
      const rm = rmMap.get(id);
      const openingStock = openingMap.get(id) ?? 0;
      const closingStock = closingMap.get(id) ?? 0;
      const typeAgg = typeMap.get(id) || {
        purchased: 0,
        consumed: 0,
        wasted: 0,
        adjustments: 0,
      };

      const variance =
        openingStock +
        typeAgg.purchased -
        typeAgg.consumed -
        typeAgg.wasted +
        typeAgg.adjustments -
        closingStock;

      return {
        rawMaterialId: id,
        rawMaterialName: rm?.name || 'Unknown',
        unit: rm?.baseUnit,
        openingStock,
        purchased: typeAgg.purchased,
        consumed: typeAgg.consumed,
        wasted: typeAgg.wasted,
        adjustments: typeAgg.adjustments,
        closingStock,
        variance,
      };
    });

    return results;
  }

  private applyDateFilter(match: any, range: DateRange) {
    if (range.from || range.to) {
      match.createdAt = {};
      if (range.from) {
        match.createdAt.$gte = range.from;
      }
      if (range.to) {
        match.createdAt.$lte = range.to;
      }
    }
  }

  private async aggregateSumByMaterial(
    outletId: string,
    opts: { to: Date; inclusiveEnd?: boolean; exclusiveEnd?: boolean },
  ) {
    const match: any = { outletId };
    if (opts.to) {
      match.createdAt = {};
      if (opts.exclusiveEnd) {
        match.createdAt.$lt = opts.to;
      }
      if (opts.inclusiveEnd) {
        match.createdAt.$lte = opts.to;
      }
    }

    return this.ledgerModel
      .aggregate([
        { $match: match },
        { $group: { _id: '$rawMaterialId', total: { $sum: '$quantityChange' } } },
      ])
      .exec();
  }

  private async aggregateSumsByType(outletId: string, from: Date, to: Date) {
    return this.ledgerModel
      .aggregate([
        {
          $match: {
            outletId,
            createdAt: { $gte: from, $lte: to },
            transactionType: {
              $in: [
                InventoryTransactionType.PURCHASE,
                InventoryTransactionType.SALE_CONSUMPTION,
                InventoryTransactionType.WASTAGE,
                InventoryTransactionType.ADJUSTMENT,
              ],
            },
          },
        },
        {
          $group: {
            _id: { rawMaterialId: '$rawMaterialId', transactionType: '$transactionType' },
            total: { $sum: '$quantityChange' },
          },
        },
      ])
      .exec();
  }

  validateDateRange(from?: string, to?: string) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined;
    if (from) {
      fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) throw new BadRequestException('Invalid from date');
    }
    if (to) {
      toDate = new Date(to);
      if (isNaN(toDate.getTime())) throw new BadRequestException('Invalid to date');
    }
    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException('from date cannot be after to date');
    }
    const now = new Date();
    if (fromDate && fromDate > now) {
      throw new BadRequestException('from date cannot be in the future');
    }
    if (toDate && toDate > now) {
      throw new BadRequestException('to date cannot be in the future');
    }
    return { from: fromDate, to: toDate };
  }
}

