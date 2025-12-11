import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item, ItemDocument } from './schema/item.schema';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    // If this is a channel item, validate base item exists
    if (createItemDto.baseItemId) {
      const baseItem = await this.itemModel.findById(createItemDto.baseItemId);
      if (!baseItem) {
        throw new NotFoundException('Base item not found');
      }
    }

    const createdItem = new this.itemModel(createItemDto);
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
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const updatedItem = await this.itemModel
      .findByIdAndUpdate(id, updateItemDto, { new: true })
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
