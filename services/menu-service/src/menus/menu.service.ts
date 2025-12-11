// src/menus/menus.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu, MenuDocument } from './schema/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<MenuDocument>) {}

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

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuModel.findById(id).exec();
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu;
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
