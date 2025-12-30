import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Taxes, TaxesDocument } from './schema/taxes.schema';
import { CreateTaxesDto } from './dto/create-taxes.dto';
import { UpdateTaxesDto } from './dto/update-taxes.dto';

@Injectable()
export class TaxesService {
  constructor(
    @InjectModel(Taxes.name) private taxesModel: Model<TaxesDocument>,
  ) {}

  async create(createTaxesDto: CreateTaxesDto): Promise<Taxes> {
    const createdTaxes = new this.taxesModel(createTaxesDto);
    return createdTaxes.save();
  }

  async findAll(restaurantId: string): Promise<Taxes[]> {
    
    return this.taxesModel
      .find({ restaurantId })
      {{#if hasRank}}
      .sort({ rank: 1 })
      
      .exec();
    {{else}}
    return this.taxesModel
      
      .exec();
    {{/if}}
  }

  async findOne(id: string): Promise<Taxes> {
    const taxes = await this.taxesModel.findById(id).exec();
    if (!taxes) {
      throw new NotFoundException('Taxes not found');
    }
    return taxes;
  }

  async update(id: string, updateTaxesDto: UpdateTaxesDto): Promise<Taxes> {
    const updatedTaxes = await this.taxesModel
      .findByIdAndUpdate(id, updateTaxesDto, { new: true })
      .exec();

    if (!updatedTaxes) {
      throw new NotFoundException('Taxes not found');
    }

    return updatedTaxes;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taxesModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Taxes not found');
    }
  }
}

