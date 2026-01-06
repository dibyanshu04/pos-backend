import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { UpdateRawMaterialStatusDto } from './dto/update-raw-material-status.dto';
import { validateUnitCompatibility } from 'src/common/units/unit-validation.util';
import { LowStockAlertService } from 'src/low-stock-alert/low-stock-alert.service';
import {
  RawMaterial,
  RawMaterialDocument,
  CostingSnapshot,
} from './raw-material.schema';

@Injectable()
export class RawMaterialService {
  constructor(
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
    private readonly lowStockAlertService: LowStockAlertService,
  ) {}

  async create(createDto: CreateRawMaterialDto): Promise<RawMaterial> {
    this.validateUnits(
      createDto.purchaseUnit,
      createDto.baseUnit,
      createDto.conversionFactor,
    );

    await this.ensureUniquePerOutlet(
      createDto.outletId,
      createDto.code,
      createDto.name,
    );

    const costing = this.normalizeCosting(createDto.costing);

    const material = new this.rawMaterialModel({
      restaurantId: createDto.restaurantId,
      outletId: createDto.outletId,
      name: createDto.name.trim(),
      code: createDto.code.trim(),
      category: createDto.category,
      baseUnit: createDto.baseUnit,
      purchaseUnit: createDto.purchaseUnit,
      conversionFactor: createDto.conversionFactor,
      isPerishable: createDto.isPerishable,
      shelfLifeInDays: createDto.isPerishable
        ? createDto.shelfLifeInDays
        : undefined,
      costing,
      isActive: createDto.isActive ?? true,
      createdByUserId: createDto.createdByUserId,
      updatedByUserId: createDto.updatedByUserId,
    });

    return material.save();
  }

  async findAll(outletId: string): Promise<RawMaterial[]> {
    if (!outletId) {
      throw new BadRequestException('outletId is required');
    }

    return this.rawMaterialModel
      .find({ outletId })
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<RawMaterial> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid raw material id');
    }

    const material = await this.rawMaterialModel.findById(id).lean().exec();
    if (!material) {
      throw new NotFoundException('Raw material not found');
    }
    return material;
  }

  async update(
    id: string,
    updateDto: UpdateRawMaterialDto,
  ): Promise<RawMaterial> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid raw material id');
    }

    const existing = await this.rawMaterialModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Raw material not found');
    }

    this.validateUnits(
      updateDto.purchaseUnit ?? existing.purchaseUnit,
      updateDto.baseUnit ?? existing.baseUnit,
      updateDto.conversionFactor ?? existing.conversionFactor,
    );

    await this.ensureUniquePerOutlet(
      existing.outletId,
      updateDto.code ?? existing.code,
      updateDto.name ?? existing.name,
      id,
    );

    const updatePayload: Partial<RawMaterial> = {
      name: updateDto.name?.trim(),
      code: updateDto.code?.trim(),
      category: updateDto.category,
      baseUnit: updateDto.baseUnit,
      purchaseUnit: updateDto.purchaseUnit,
      conversionFactor: updateDto.conversionFactor,
      isPerishable: updateDto.isPerishable,
      shelfLifeInDays:
        updateDto.isPerishable === true
          ? updateDto.shelfLifeInDays
          : updateDto.isPerishable === false
            ? undefined
            : updateDto.shelfLifeInDays,
      costing: updateDto.costing
        ? this.normalizeCosting(updateDto.costing, existing.costing)
        : undefined,
      updatedByUserId: updateDto.updatedByUserId,
    };

    // Remove undefined keys to avoid overwriting
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key as keyof RawMaterial] === undefined) {
        delete updatePayload[key as keyof RawMaterial];
      }
    });

    const updated = await this.rawMaterialModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Raw material not found');
    }

    return updated;
  }

  async updateStatus(
    id: string,
    statusDto: UpdateRawMaterialStatusDto,
  ): Promise<RawMaterial> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid raw material id');
    }

    const existing = await this.rawMaterialModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Raw material not found');
    }

    // TODO: When recipe module arrives, prevent deactivation if linked to recipes/KOT

    existing.isActive = statusDto.isActive;
    if (statusDto.updatedByUserId) {
      existing.updatedByUserId = statusDto.updatedByUserId;
    }

    await existing.save();
    return existing.toObject();
  }

  async updateLowStockThreshold(
    id: string,
    lowStockThreshold: number,
  ): Promise<RawMaterial> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid raw material id');
    }
    if (lowStockThreshold < 0) {
      throw new BadRequestException('lowStockThreshold must be >= 0');
    }

    const rm = await this.rawMaterialModel.findById(id);
    if (!rm) {
      throw new NotFoundException('Raw material not found');
    }
    rm.lowStockThreshold = lowStockThreshold;
    await rm.save();

    await this.lowStockAlertService.reconcile(
      rm._id as Types.ObjectId,
      rm.outletId,
      rm.restaurantId,
    );

    return rm.toObject();
  }

  private async ensureUniquePerOutlet(
    outletId: string,
    code: string,
    name: string,
    excludeId?: string,
  ) {
    const codeFilter: any = { outletId, code: code.trim() };
    const nameFilter: any = { outletId, name: name.trim() };

    if (excludeId) {
      codeFilter._id = { $ne: excludeId };
      nameFilter._id = { $ne: excludeId };
    }

    const [codeExists, nameExists] = await Promise.all([
      this.rawMaterialModel.exists(codeFilter),
      this.rawMaterialModel.exists(nameFilter),
    ]);

    if (codeExists) {
      throw new ConflictException('Code must be unique per outlet');
    }

    if (nameExists) {
      throw new ConflictException('Name must be unique per outlet');
    }
  }

  private normalizeCosting(
    costing?: Partial<CostingSnapshot>,
    fallback?: CostingSnapshot,
  ): CostingSnapshot {
    const base = fallback ?? { averageCost: 0, lastPurchaseCost: 0 };
    return {
      averageCost: costing?.averageCost ?? base.averageCost ?? 0,
      lastPurchaseCost: costing?.lastPurchaseCost ?? base.lastPurchaseCost ?? 0,
    };
  }

  private validateUnits(
    purchaseUnit: any,
    baseUnit: any,
    conversionFactor: number,
  ) {
    if (conversionFactor === undefined || conversionFactor <= 0) {
      throw new BadRequestException('conversionFactor must be greater than 0');
    }

    try {
      validateUnitCompatibility(purchaseUnit, baseUnit);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid unit combination';
      throw new BadRequestException(message);
    }
  }
}

