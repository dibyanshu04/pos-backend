import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuServiceClient } from 'src/common/clients/menu-service.client';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { RawMaterial, RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeStatusDto } from './dto/update-recipe-status.dto';
import { Recipe, RecipeDocument } from './recipe.schema';

@Injectable()
export class RecipeService {
  constructor(
    @InjectModel(Recipe.name)
    private readonly recipeModel: Model<RecipeDocument>,
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
    private readonly menuServiceClient: MenuServiceClient,
  ) {}

  async create(dto: CreateRecipeDto): Promise<Recipe> {
    const menuItemSnapshot = await this.menuServiceClient.validateMenuItem(
      dto.menuItemId,
      dto.outletId,
    );

    const components = await this.validateAndBuildComponents(dto);

    // Deactivate existing active recipe for this menuItem/outlet
    await this.recipeModel.updateMany(
      { menuItemId: dto.menuItemId, outletId: dto.outletId, isActive: true },
      { $set: { isActive: false, updatedByUserId: dto.createdByUserId } },
    );

    const recipe = new this.recipeModel({
      restaurantId: dto.restaurantId,
      outletId: dto.outletId,
      menuItemId: dto.menuItemId,
      menuItemName: menuItemSnapshot.name,
      components,
      isActive: true,
      createdByUserId: dto.createdByUserId,
    });

    return recipe.save();
  }

  async findByMenuItem(menuItemId: string, outletId: string): Promise<Recipe> {
    const recipe = await this.recipeModel
      .findOne({ menuItemId, outletId, isActive: true })
      .lean()
      .exec();
    if (!recipe) {
      throw new NotFoundException('Active recipe not found for menu item and outlet');
    }
    return recipe;
  }

  async findAll(outletId: string): Promise<Recipe[]> {
    if (!outletId) {
      throw new BadRequestException('outletId is required');
    }
    return this.recipeModel
      .find({ outletId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async updateStatus(id: string, dto: UpdateRecipeStatusDto): Promise<Recipe> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid recipe id');
    }

    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (dto.isActive) {
      // Ensure no other active recipe for this menuItem/outlet
      const conflict = await this.recipeModel.exists({
        _id: { $ne: id },
        menuItemId: recipe.menuItemId,
        outletId: recipe.outletId,
        isActive: true,
      });
      if (conflict) {
        throw new ConflictException(
          'Another active recipe exists for this menu item and outlet',
        );
      }
    }

    recipe.isActive = dto.isActive;
    recipe.updatedByUserId = dto.updatedByUserId;
    await recipe.save();
    return recipe.toObject();
  }

  private async validateAndBuildComponents(
    dto: CreateRecipeDto,
  ): Promise<
    {
      rawMaterialId: Types.ObjectId;
      rawMaterialName: string;
      quantityPerUnit: number;
      unit: BaseUnitEnum;
    }[]
  > {
    if (!dto.components?.length) {
      throw new BadRequestException('At least one component is required');
    }

    const seen = new Set<string>();
    const components = [];

    for (const comp of dto.components) {
      if (seen.has(comp.rawMaterialId)) {
        throw new BadRequestException('Duplicate rawMaterialId in components');
      }
      seen.add(comp.rawMaterialId);

      if (comp.quantityPerUnit <= 0) {
        throw new BadRequestException('quantityPerUnit must be greater than 0');
      }

      const rm = await this.rawMaterialModel.findById(comp.rawMaterialId).lean();
      if (!rm) {
        throw new NotFoundException('Raw material not found');
      }
      if (!rm.isActive) {
        throw new BadRequestException('Raw material is inactive');
      }
      if (rm.outletId !== dto.outletId) {
        throw new BadRequestException('Raw material does not belong to the outlet');
      }

      components.push({
        rawMaterialId: rm._id as Types.ObjectId,
        rawMaterialName: rm.name,
        quantityPerUnit: comp.quantityPerUnit,
        unit: rm.baseUnit as BaseUnitEnum,
      });
    }

    return components;
  }
}

