import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Addon, AddonDocument } from './schema/addon.schema';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';

@Injectable()
export class AddonsService {
  constructor(
    @InjectModel(Addon.name) private addonModel: Model<AddonDocument>,
  ) {}

  async create(createAddonDto: CreateAddonDto): Promise<Addon> {
    const createdAddon = new this.addonModel(createAddonDto);
    return createdAddon.save();
  }

  async findAll(restaurantId: string): Promise<Addon[]> {
    return this.addonModel
      .find({ restaurantId })
      .sort({ rank: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Addon> {
    const addon = await this.addonModel.findById(id).exec();
    if (!addon) {
      throw new NotFoundException('Addon not found');
    }
    return addon;
  }

  async update(id: string, updateAddonDto: UpdateAddonDto): Promise<Addon> {
    const updatedAddon = await this.addonModel
      .findByIdAndUpdate(id, updateAddonDto, { new: true })
      .exec();

    if (!updatedAddon) {
      throw new NotFoundException('Addon not found');
    }

    return updatedAddon;
  }

  async remove(id: string): Promise<void> {
    const result = await this.addonModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Addon not found');
    }
  }

  async findByRestaurant(restaurantId: string): Promise<Addon[]> {
    return this.addonModel
      .find({ restaurantId, status: 'Active' })
      .sort({ rank: 1 })
      .exec();
  }

  async updateRank(
    updates: Array<{ id: string; rank: number }>,
  ): Promise<void> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(update.id) },
        update: { rank: update.rank },
      },
    }));

    await this.addonModel.bulkWrite(bulkOps);
  }
}

