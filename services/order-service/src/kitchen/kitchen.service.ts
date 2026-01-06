import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kitchen, KitchenDocument } from './schemas/kitchen.schema';
import { CreateKitchenDto } from './dto/create-kitchen.dto';
import { UpdateKitchenDto } from './dto/update-kitchen.dto';
import { UpdateKitchenStatusDto } from './dto/update-kitchen-status.dto';
import { KitchenResponseDto } from './dto/kitchen-response.dto';

@Injectable()
export class KitchenService {
  constructor(
    @InjectModel(Kitchen.name) private kitchenModel: Model<KitchenDocument>,
  ) {}

  /**
   * Create a new kitchen
   * Ensures only one default kitchen per outlet
   */
  async create(createKitchenDto: CreateKitchenDto): Promise<KitchenResponseDto> {
    // Check if code already exists for this outlet
    const existingKitchen = await this.kitchenModel.findOne({
      outletId: createKitchenDto.outletId,
      code: createKitchenDto.code,
    });

    if (existingKitchen) {
      throw new ConflictException(
        `Kitchen with code ${createKitchenDto.code} already exists for this outlet`,
      );
    }

    // If setting as default, unset other default kitchens for this outlet
    if (createKitchenDto.isDefault) {
      await this.kitchenModel.updateMany(
        { outletId: createKitchenDto.outletId, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    const kitchen = new this.kitchenModel({
      ...createKitchenDto,
      isDefault: createKitchenDto.isDefault ?? false,
      isActive: createKitchenDto.isActive ?? true,
    });

    const savedKitchen = await kitchen.save();
    return this.toResponseDto(savedKitchen);
  }

  /**
   * Find all kitchens for an outlet
   */
  async findByOutlet(outletId: string): Promise<KitchenResponseDto[]> {
    const kitchens = await this.kitchenModel
      .find({ outletId, isActive: true })
      .sort({ isDefault: -1, name: 1 })
      .exec();

    return kitchens.map((kitchen) => this.toResponseDto(kitchen));
  }

  /**
   * Find all kitchens (including inactive) for an outlet
   */
  async findAllByOutlet(outletId: string): Promise<KitchenResponseDto[]> {
    const kitchens = await this.kitchenModel
      .find({ outletId })
      .sort({ isDefault: -1, name: 1 })
      .exec();

    return kitchens.map((kitchen) => this.toResponseDto(kitchen));
  }

  /**
   * Find kitchen by ID
   */
  async findOne(id: string): Promise<KitchenResponseDto> {
    const kitchen = await this.kitchenModel.findById(id).exec();

    if (!kitchen) {
      throw new NotFoundException(`Kitchen with ID ${id} not found`);
    }

    return this.toResponseDto(kitchen);
  }

  /**
   * Get default kitchen for an outlet
   */
  async findDefaultKitchen(outletId: string): Promise<KitchenDocument | null> {
    return this.kitchenModel
      .findOne({ outletId, isDefault: true, isActive: true })
      .exec();
  }

  /**
   * Get default kitchen or throw error
   */
  async getDefaultKitchenOrFail(outletId: string): Promise<KitchenDocument> {
    const defaultKitchen = await this.findDefaultKitchen(outletId);

    if (!defaultKitchen) {
      throw new NotFoundException(
        `No default kitchen found for outlet ${outletId}. Please create a default kitchen first.`,
      );
    }

    return defaultKitchen;
  }

  /**
   * Find kitchen by ID and outlet (for validation)
   */
  async findByIdAndOutlet(
    id: string,
    outletId: string,
  ): Promise<KitchenDocument | null> {
    return this.kitchenModel.findOne({ _id: id, outletId, isActive: true }).exec();
  }

  /**
   * Validate kitchen exists and is active for outlet
   */
  async validateKitchen(
    kitchenId: string,
    outletId: string,
  ): Promise<KitchenDocument> {
    const kitchen = await this.findByIdAndOutlet(kitchenId, outletId);

    if (!kitchen) {
      throw new NotFoundException(
        `Kitchen with ID ${kitchenId} not found or inactive for outlet ${outletId}`,
      );
    }

    return kitchen;
  }

  /**
   * Update kitchen
   */
  async update(
    id: string,
    updateKitchenDto: UpdateKitchenDto,
  ): Promise<KitchenResponseDto> {
    const kitchen = await this.kitchenModel.findById(id).exec();

    if (!kitchen) {
      throw new NotFoundException(`Kitchen with ID ${id} not found`);
    }

    // If updating code, check for conflicts
    if (updateKitchenDto.code && updateKitchenDto.code !== kitchen.code) {
      const existingKitchen = await this.kitchenModel.findOne({
        outletId: kitchen.outletId,
        code: updateKitchenDto.code,
        _id: { $ne: id },
      });

      if (existingKitchen) {
        throw new ConflictException(
          `Kitchen with code ${updateKitchenDto.code} already exists for this outlet`,
        );
      }
    }

    // If setting as default, unset other default kitchens
    if (updateKitchenDto.isDefault === true) {
      await this.kitchenModel.updateMany(
        { outletId: kitchen.outletId, isDefault: true, _id: { $ne: id } },
        { $set: { isDefault: false } },
      );
    }

    // Update kitchen
    Object.assign(kitchen, updateKitchenDto);
    const updatedKitchen = await kitchen.save();

    return this.toResponseDto(updatedKitchen);
  }

  /**
   * Update kitchen status (active/inactive)
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateKitchenStatusDto,
  ): Promise<KitchenResponseDto> {
    const kitchen = await this.kitchenModel.findById(id).exec();

    if (!kitchen) {
      throw new NotFoundException(`Kitchen with ID ${id} not found`);
    }

    // Cannot deactivate default kitchen
    if (!updateStatusDto.isActive && kitchen.isDefault) {
      throw new BadRequestException(
        'Cannot deactivate default kitchen. Please set another kitchen as default first.',
      );
    }

    kitchen.isActive = updateStatusDto.isActive;
    const updatedKitchen = await kitchen.save();

    return this.toResponseDto(updatedKitchen);
  }

  /**
   * Delete kitchen (soft delete by setting inactive)
   */
  async delete(id: string): Promise<void> {
    const kitchen = await this.kitchenModel.findById(id).exec();

    if (!kitchen) {
      throw new NotFoundException(`Kitchen with ID ${id} not found`);
    }

    // Cannot delete default kitchen
    if (kitchen.isDefault) {
      throw new BadRequestException(
        'Cannot delete default kitchen. Please set another kitchen as default first.',
      );
    }

    // Soft delete by setting inactive
    kitchen.isActive = false;
    await kitchen.save();
  }

  /**
   * Convert kitchen document to response DTO
   */
  private toResponseDto(kitchen: KitchenDocument): KitchenResponseDto {
    return {
      _id: kitchen._id.toString(),
      restaurantId: kitchen.restaurantId,
      outletId: kitchen.outletId,
      name: kitchen.name,
      code: kitchen.code,
      isDefault: kitchen.isDefault,
      isActive: kitchen.isActive,
      printerId: kitchen.printerId,
      createdAt: kitchen.createdAt,
      updatedAt: kitchen.updatedAt,
    };
  }
}

