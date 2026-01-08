import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { KitchenServiceClient } from '../common/clients/kitchen-service.client';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private kitchenServiceClient: KitchenServiceClient,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Validate kitchen if provided
    if (createCategoryDto.kitchenId) {
      await this.validateKitchenForCategory(
        createCategoryDto.kitchenId,
        createCategoryDto.outletId,
      );
    }

    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(outletId: string): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ outletId })
      .sort({ displayOrder: 1 })
      .exec();
    
    // Enrich with kitchen information
    return this.enrichCategoriesWithKitchen(categories);
  }

  /**
   * Return categories with kitchen info included.
   * Added to support optional includeKitchen flag in controller.
   */
  async findAllWithKitchen(outletId: string): Promise<any[]> {
    return this.findAll(outletId);
  }

  async findOne(id: string): Promise<any> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    // Enrich with kitchen information
    const enriched = await this.enrichCategoriesWithKitchen([category]);
    return enriched[0];
  }

  /**
   * Return single category with kitchen info included.
   * Added to support optional includeKitchen flag in controller.
   */
  async findOneWithKitchen(id: string): Promise<any> {
    return this.findOne(id);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Get existing category to check outletId
    const existingCategory = await this.categoryModel.findById(id).exec();
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Validate kitchen if provided
    if (updateCategoryDto.kitchenId) {
      await this.validateKitchenForCategory(
        updateCategoryDto.kitchenId,
        existingCategory.outletId,
      );
    }

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

  async findByOutlet(outletId: string): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ outletId, status: 'Active' })
      .exec();
    
    // Enrich with kitchen information
    return this.enrichCategoriesWithKitchen(categories);
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

  /**
   * Enrich categories with kitchen information
   * @private
   */
  private async enrichCategoriesWithKitchen(
    categories: CategoryDocument[],
  ): Promise<any[]> {
    return Promise.all(
      categories.map(async (category) => {
        const categoryObj = category.toObject();
        
        // If category has kitchenId, fetch kitchen info
        if (category.kitchenId) {
          try {
            const kitchen = await this.kitchenServiceClient.getKitchenById(
              category.kitchenId.toString(),
            );
            categoryObj.kitchen = {
              _id: kitchen._id,
              name: kitchen.name,
            };
          } catch (error) {
            // If kitchen service client is not implemented or kitchen not found,
            // just include kitchenId without kitchen details
            categoryObj.kitchen = {
              _id: category.kitchenId.toString(),
              name: null, // Will be null if kitchen cannot be fetched
            };
          }
        }
        
        return categoryObj;
      }),
    );
  }

  /**
   * Validate kitchen exists, is active, and belongs to the same outlet
   * @private
   */
  private async validateKitchenForCategory(
    kitchenId: string,
    outletId: string,
  ): Promise<void> {
    try {
      const kitchen = await this.kitchenServiceClient.validateKitchen(
        kitchenId,
        outletId,
      );

      if (!kitchen.isActive) {
        throw new BadRequestException(
          `Cannot assign inactive kitchen ${kitchenId} to category`,
        );
      }

      if (kitchen.outletId !== outletId) {
        throw new BadRequestException(
          `Kitchen ${kitchenId} does not belong to outlet ${outletId}`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // If kitchen service client is not implemented, log warning but allow
      // In production, this should always be implemented
      console.warn(
        `Kitchen validation skipped: ${error.message}. Please implement KitchenServiceClient.`,
      );
    }
  }
}
