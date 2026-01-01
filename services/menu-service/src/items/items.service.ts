import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item, ItemDocument } from './schema/item.schema';
import { Tax, TaxDocument } from '../taxes/schema/taxes.schema';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Tax.name) private taxModel: Model<TaxDocument>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    // If this is a channel item, validate base item exists
    if (createItemDto.baseItemId) {
      const baseItem = await this.itemModel.findById(createItemDto.baseItemId);
      if (!baseItem) {
        throw new NotFoundException('Base item not found');
      }
    }

    // Convert variantPricing object to array format if provided
    let variantPricingArray : any = [];
    if (createItemDto.variantPricing) {
      variantPricingArray = Object.entries(createItemDto.variantPricing).flatMap(
        ([variantId, valuePricing]) =>
          Object.entries(valuePricing).map(([variantValueName, priceOverride]) => ({
            variantId,
            variantValueName,
            priceOverride,
          })),
      );
    }

    const itemData = {
      ...createItemDto,
      variantPricing: variantPricingArray.length > 0 ? variantPricingArray : undefined,
    };

    const createdItem = new this.itemModel(itemData);
    return createdItem.save();
  }

  async findAll(outletId: string, categoryId?: string): Promise<Item[]> {
    const filter: any = { outletId };
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    return this.itemModel.find(filter).sort({ displayOrder: 1 }).exec();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemModel
      .findById(id)
      .populate('variantIds', 'name values department')
      .populate('addonIds', 'departmentName items applicableVariantIds')
      .exec();
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async findOneWithTaxes(id: string): Promise<any> {
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Populate tax details if taxIds exist
    let taxes : any = [];
    if (item.taxIds && item.taxIds.length > 0) {
      taxes  = await this.taxModel
        .find({ _id: { $in: item.taxIds }, isActive: true })
        .select('name value taxType calculationType taxTitle gstComponent displayName')
        .sort({ priority: 1 })
        .exec();
    }

    return {
      ...item.toObject(),
      taxes: taxes.map((tax) => ({
        id: tax._id,
        name: tax.name,
        value: tax.value,
        taxType: tax.taxType,
        calculationType: tax.calculationType,
        displayName: tax.taxTitle || tax.displayName || tax.name,
        gstComponent: tax.gstComponent,
      })),
    };
  }

  async findAllWithTaxes(outletId: string, categoryId?: string): Promise<any[]> {
    const filter: any = { outletId };
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const items = await this.itemModel.find(filter).sort({ displayOrder: 1 }).exec();
    
    // Get all unique tax IDs
    const allTaxIds = [...new Set(items.flatMap((item) => item.taxIds || []))];
    
    // Fetch all taxes in one query
    const taxesMap = new Map();
    if (allTaxIds.length > 0) {
      const taxes = await this.taxModel
        .find({ _id: { $in: allTaxIds }, isActive: true })
        .select('name value taxType calculationType taxTitle gstComponent displayName')
        .exec();
      
      taxes.forEach((tax) => {
        taxesMap.set(tax._id.toString(), {
          id: tax._id,
          name: tax.name,
          value: tax.value,
          taxType: tax.taxType,
          calculationType: tax.calculationType,
          displayName: tax.taxTitle || tax.displayName || tax.name,
          gstComponent: tax.gstComponent,
        });
      });
    }

    // Map taxes to items
    return items.map((item) => ({
      ...item.toObject(),
      taxes: (item.taxIds || []).map((taxId) => taxesMap.get(taxId.toString())).filter(Boolean),
    }));
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    // Convert variantPricing object to array format if provided
    let updateData: any = { ...updateItemDto };
    if (updateItemDto.variantPricing) {
      const variantPricingArray = Object.entries(updateItemDto.variantPricing).flatMap(
        ([variantId, valuePricing]) =>
          Object.entries(valuePricing).map(([variantValueName, priceOverride]) => ({
            variantId,
            variantValueName,
            priceOverride,
          })),
      );
      updateData.variantPricing = variantPricingArray;
    }

    const updatedItem = await this.itemModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedItem) {
      throw new NotFoundException('Item not found');
    }

    return updatedItem;
  }

  async remove(id: string): Promise<void> {
    const result = await this.itemModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Item not found');
    }
  }

  async findByCategory(categoryId: string): Promise<Item[]> {
    return this.itemModel
      .find({ categoryId, isAvailable: true })
      .sort({ displayOrder: 1 })
      .exec();
  }

  async findByOutlet(outletId: string): Promise<Item[]> {
    return this.itemModel
      .find({ outletId, isAvailable: true })
      .sort({ displayOrder: 1 })
      .exec();
  }

  async updateAvailability(
    itemId: string,
    isAvailable: boolean,
  ): Promise<Item> {
    const item = await this.itemModel
      .findByIdAndUpdate(itemId, { isAvailable }, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async bulkUpdateAvailability(
    itemIds: string[],
    isAvailable: boolean,
  ): Promise<void> {
    await this.itemModel
      .updateMany({ _id: { $in: itemIds } }, { isAvailable })
      .exec();
  }

  async updateChannelPrice(
    itemId: string,
    channel: 'zomato' | 'swiggy',
    price: number,
  ): Promise<Item> {
    const updateQuery = {
      [`channelSpecificData.${channel}.price`]: price,
      [`channelSpecificData.${channel}.isAvailable`]: true,
    };

    const item = await this.itemModel
      .findByIdAndUpdate(itemId, updateQuery, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }
}
