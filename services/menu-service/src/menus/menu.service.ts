// src/menus/menus.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu, MenuDocument } from './schema/menu.schema';
import { Item, ItemDocument } from '../items/schema/item.schema';
import { Category, CategoryDocument } from '../categories/schema/category.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    // If this is a channel menu, validate base menu exists
    if (createMenuDto.baseMenuId && createMenuDto.type !== 'base') {
      const baseMenu = await this.menuModel.findById(createMenuDto.baseMenuId);
      if (!baseMenu) {
        throw new NotFoundException('Base menu not found');
      }
    }

    const createdMenu = new this.menuModel(createMenuDto);
    return createdMenu.save();
  }

  async findAll(outletId: string): Promise<Menu[]> {
    return this.menuModel.find({ outletId }).exec();
  }

  /**
   * Get menu with categories and items grouped by category.
   * Returns simplified payload with only required fields.
   */
  async findOne(id: string): Promise<any> {
    const menu = await this.menuModel.findById(id).lean().exec();

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const menuObj: any = menu;
    const itemIds: string[] = (menuObj.itemIds || []).map((id: any) =>
      id?._id?.toString?.() ?? id?.toString?.() ?? String(id),
    );

    if (itemIds.length === 0) {
      return {
        ...menuObj,
        categories: [],
      };
    }

    // Fetch items with only required fields
    const items = await this.itemModel
      .find({ _id: { $in: itemIds } })
      .select('_id name description displayOrder isAvailable categoryId shortCode onlineDisplayName price basePrice')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .exec();

    // Extract unique category IDs from items
    const categoryIdsSet = new Set<string>();
    items.forEach((item: any) => {
      const catId = item?.categoryId?.toString?.() ?? String(item?.categoryId);
      if (catId && catId !== 'null' && catId !== 'undefined') {
        categoryIdsSet.add(catId);
      }
    });

    const categoryIds = Array.from(categoryIdsSet);
    if (categoryIds.length === 0) {
      return {
        ...menuObj,
        categories: [],
      };
    }

    // Fetch all categories
    const categories = await this.categoryModel
      .find({ _id: { $in: categoryIds } })
      .lean()
      .exec();

    // Create category map
    const categoryMap = new Map<string, any>();
    categories.forEach((cat: any) => {
      const catId = cat._id?.toString?.() ?? String(cat._id);
      categoryMap.set(catId, cat);
    });

    // Group items by category
    const itemsByCategory = new Map<string, any[]>();
    items.forEach((item: any) => {
      const catId = item?.categoryId?.toString?.() ?? String(item?.categoryId);
      if (catId && catId !== 'null' && catId !== 'undefined') {
        if (!itemsByCategory.has(catId)) {
          itemsByCategory.set(catId, []);
        }
        console.log('item', item);
        // Format item with categoryId as string
        itemsByCategory.get(catId)!.push({
          _id: item._id,
          name: item.name,
          categoryId: catId,
          description: item.description || '',
          isAvailable: item.isAvailable ?? true,
          displayOrder: item.displayOrder ?? 0,
          shortCode: item.shortCode || '',
          onlineDisplayName: item.onlineDisplayName || '',
          price: item.price || 0,
          basePrice: item.basePrice || 0,
        });
      }
    });

    // Build categories array with items
    const categoriesWithItems = categories
      .map((cat: any) => {
        const catId = cat._id?.toString?.() ?? String(cat._id);
        const categoryItems = itemsByCategory.get(catId) || [];
        return {
          ...cat,
          items: categoryItems,
        };
      })
      .filter((cat: any) => cat.items.length > 0) // Only include categories with items
      .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0)); // Sort by rank

    // Remove itemIds and categoryIds from response
    const { itemIds: _, categoryIds: __, ...menuData } = menuObj;

    return {
      ...menuData,
      categories: categoriesWithItems,
    };
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const updatedMenu = await this.menuModel
      .findByIdAndUpdate(id, updateMenuDto, { new: true })
      .exec();

    if (!updatedMenu) {
      throw new NotFoundException('Menu not found');
    }

    // Increment version for change tracking
    updatedMenu.version += 1;
    return updatedMenu.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.menuModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Menu not found');
    }
  }

  async findByType(outletId: string, type: string): Promise<Menu[]> {
    return this.menuModel.find({ outletId, type }).exec();
  }

  async getBaseMenu(outletId: string): Promise<Menu> {
    const baseMenu = await this.menuModel
      .findOne({ outletId, type: 'base' })
      .exec();
    if (!baseMenu) {
      throw new NotFoundException('Base menu not found for this outlet');
    }
    return baseMenu;
  }

  async syncWithBaseMenu(menuId: string): Promise<Menu> {
    const menu = await this.menuModel.findById(menuId).exec();
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    if (!menu.baseMenuId) {
      throw new NotFoundException('This menu is not linked to a base menu');
    }

    const baseMenu = await this.menuModel.findById(menu.baseMenuId).exec();
    if (!baseMenu) {
      throw new NotFoundException('Base menu not found');
    }

    // Implement your sync logic here
    // This would typically copy categories and items from base menu
    // while preserving channel-specific customizations

    menu.version = baseMenu.version;
    return menu.save();
  }
}
