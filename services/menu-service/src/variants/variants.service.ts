import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Variant, VariantDocument } from './schema/variant.schema';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
  ) {}

  async create(createVariantDto: CreateVariantDto): Promise<Variant> {
    const createdVariant = new this.variantModel(createVariantDto);
    return createdVariant.save();
  }

  async findAll(restaurantId: string): Promise<Variant[]> {
    return this.variantModel.find({ restaurantId }).exec();
  }

  async findOne(id: string): Promise<Variant> {
    const variant = await this.variantModel.findById(id).exec();
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    return variant;
  }

  async update(
    id: string,
    updateVariantDto: UpdateVariantDto,
  ): Promise<Variant> {
    const updatedVariant = await this.variantModel
      .findByIdAndUpdate(id, updateVariantDto, { new: true })
      .exec();

    if (!updatedVariant) {
      throw new NotFoundException('Variant not found');
    }

    return updatedVariant;
  }

  async remove(id: string): Promise<void> {
    const result = await this.variantModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Variant not found');
    }
  }

  async findByRestaurant(restaurantId: string): Promise<Variant[]> {
    return this.variantModel
      .find({ restaurantId, status: 'Active' })
      .exec();
  }
}

