import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(outletId: string): Promise<Category[]> {
    return this.categoryModel
      .find({ outletId })
      .sort({ displayOrder: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Category not found');
    }
  }

  async findByOutlet(outletId: string): Promise<Category[]> {
    return this.categoryModel
      .find({ outletId, status: 'Active' })
      .exec();
  }

  // async updateDisplayOrder(
  //   categoryId: string,
  //   displayOrder: number,
  // ): Promise<Category> {
  //   const category = await this.categoryModel
  //     .findByIdAndUpdate(categoryId, { displayOrder }, { new: true })
  //     .exec();

  //   if (!category) {
  //     throw new NotFoundException('Category not found');
  //   }

  //   return category;
  // }

  async bulkUpdateDisplayOrder(
    updates: Array<{ id: string; displayOrder: number }>,
  ): Promise<void> {
    const bulkOps :any = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { displayOrder: update.displayOrder },
      },
    }));

    await this.categoryModel.bulkWrite(bulkOps);
  }
}
