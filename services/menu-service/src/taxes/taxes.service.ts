import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tax, TaxDocument } from './schema/taxes.schema';
import { CreateTaxDto } from './dto/create-taxes.dto';
import { UpdateTaxDto } from './dto/update-taxes.dto';

@Injectable()
export class TaxesService {
  constructor(
    @InjectModel(Tax.name) private taxModel: Model<TaxDocument>,
  ) {}

  async create(createTaxDto: CreateTaxDto): Promise<Tax | Tax[]> {
    // If GST Slab, create CGST and SGST automatically (Petpooja style)
    if (createTaxDto.taxCategory === 'GST_SLAB') {
      const gstPercentage = createTaxDto.value;
      const cgstPercentage = gstPercentage / 2;
      const sgstPercentage = gstPercentage / 2;

      // Generate a unique identifier for this GST Slab pair
      const gstSlabId = `gst_${Date.now()}`;

      // Create CGST
      const cgstData = {
        ...createTaxDto,
        name: `CGST ${cgstPercentage}%`,
        value: cgstPercentage,
        taxCode: 'CGST',
        gstComponent: 'CGST',
        taxTitle: createTaxDto.taxTitle || 'CGST',
        parentGstSlabId: gstSlabId,
      };

      // Create SGST
      const sgstData = {
        ...createTaxDto,
        name: `SGST ${sgstPercentage}%`,
        value: sgstPercentage,
        taxCode: 'SGST',
        gstComponent: 'SGST',
        taxTitle: createTaxDto.taxTitle || 'SGST',
        parentGstSlabId: gstSlabId,
      };

      const cgst = new this.taxModel(cgstData);
      const sgst = new this.taxModel(sgstData);

      // Save both taxes
      const savedCgst = await cgst.save();
      const savedSgst = await sgst.save();

      return [savedCgst, savedSgst];
    }

    // Regular tax creation
    const createdTax = new this.taxModel(createTaxDto);
    return createdTax.save();
  }

  async findAll(
    restaurantId: string,
    scope?: string,
    isActive?: boolean,
    outletId?: string,
  ): Promise<Tax[]> {
    const query: any = { restaurantId };

    if (scope) {
      query.scope = scope;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (outletId) {
      query.$or = [
        { outletIds: { $size: 0 } }, // Empty array = all outlets
        { outletIds: outletId }, // Specific outlet
      ];
    }

    return this.taxModel.find(query).sort({ priority: 1, rank: 1 }).exec();
  }

  async findOne(id: string): Promise<Tax> {
    const tax = await this.taxModel.findById(id).exec();
    if (!tax) {
      throw new NotFoundException('Tax not found');
    }
    return tax;
  }

  async update(id: string, updateTaxDto: UpdateTaxDto): Promise<Tax> {
    const updatedTax = await this.taxModel
      .findByIdAndUpdate(id, updateTaxDto, { new: true })
      .exec();

    if (!updatedTax) {
      throw new NotFoundException('Tax not found');
    }

    return updatedTax;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taxModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Tax not found');
    }
  }

  // Tax Query Methods
  async findApplicableTaxesForItem(
    itemId: string,
    restaurantId: string,
    outletId?: string,
  ): Promise<Tax[]> {
    const query: any = {
      restaurantId,
      scope: 'ITEM',
      isActive: true,
    };

    if (outletId) {
      query.$or = [
        { outletIds: { $size: 0 } },
        { outletIds: outletId },
      ];
    }

    query.$and = [
      {
        $or: [
          { itemIds: { $size: 0 } }, // Empty = all items
          { itemIds: itemId }, // Specific item
        ],
      },
      {
        excludedItemIds: { $ne: itemId }, // Not excluded
      },
    ];

    return this.taxModel.find(query).sort({ priority: 1 }).exec();
  }

  async findApplicableTaxesForCategory(
    categoryId: string,
    restaurantId: string,
    outletId?: string,
  ): Promise<Tax[]> {
    const query: any = {
      restaurantId,
      scope: 'CATEGORY',
      isActive: true,
    };

    if (outletId) {
      query.$or = [
        { outletIds: { $size: 0 } },
        { outletIds: outletId },
      ];
    }

    query.$and = [
      {
        $or: [
          { categoryIds: { $size: 0 } }, // Empty = all categories
          { categoryIds: categoryId }, // Specific category
        ],
      },
      {
        excludedCategoryIds: { $ne: categoryId }, // Not excluded
      },
    ];

    return this.taxModel.find(query).sort({ priority: 1 }).exec();
  }

  async findBillLevelTaxes(
    restaurantId: string,
    outletId?: string,
  ): Promise<Tax[]> {
    const query: any = {
      restaurantId,
      scope: 'BILL',
      isActive: true,
    };

    if (outletId) {
      query.$or = [
        { outletIds: { $size: 0 } },
        { outletIds: outletId },
      ];
    }

    return this.taxModel.find(query).sort({ priority: 1 }).exec();
  }

  async updatePriority(updates: Array<{ id: string; priority: number }>): Promise<void> {
    const bulkOps : any = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { priority: update.priority },
      },
    }));

    await this.taxModel.bulkWrite(bulkOps);
  }

  async toggleStatus(id: string, isActive: boolean): Promise<Tax> {
    const updatedTax = await this.taxModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .exec();

    if (!updatedTax) {
      throw new NotFoundException('Tax not found');
    }

    return updatedTax;
  }

  // Get taxes for item selection dropdown (Petpooja style)
  async getTaxesForSelection(
    restaurantId: string,
    outletId?: string,
  ): Promise<Tax[]> {
    const query: any = {
      restaurantId,
      isActive: true,
      scope: 'ITEM', // Only item-level taxes for selection
    };

    if (outletId) {
      query.$or = [
        { outletIds: { $size: 0 } },
        { outletIds: outletId },
      ];
    }

    return this.taxModel
      .find(query)
      .sort({ priority: 1, rank: 1 })
      .select('name value taxType calculationType taxTitle gstComponent')
      .exec();
  }
}
