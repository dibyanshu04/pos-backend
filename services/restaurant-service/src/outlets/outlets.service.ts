import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { Outlet, OutletDocument } from './schema/outlets.schema';
import { UpdateOutletDto } from './dto/update-outlet.dto';

@Injectable()
export class OutletsService {
  constructor(
    @InjectModel(Outlet.name) private outletModel: Model<OutletDocument>,
  ) {}

  async create(createOutletDto: CreateOutletDto): Promise<Outlet> {
    // Check if restaurant exists (you might want to verify this)
    const existingOutlet = await this.outletModel.findOne({
      restaurantId: createOutletDto.restaurantId,
      name: createOutletDto.name,
    });

    if (existingOutlet) {
      throw new ConflictException(
        'Outlet with this name already exists for this restaurant',
      );
    }

    const createdOutlet = new this.outletModel(createOutletDto);
    return createdOutlet.save();
  }

  async findAll(restaurantId: string): Promise<Outlet[]> {
    return this.outletModel.find({ restaurantId }).exec();
  }

  async findOne(id: string): Promise<Outlet> {
    const outlet = await this.outletModel.findById(id).exec();
    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }
    return outlet;
  }

  async update(id: string, updateOutletDto: UpdateOutletDto): Promise<Outlet> {
    const updatedOutlet = await this.outletModel
      .findByIdAndUpdate(id, updateOutletDto, { new: true })
      .exec();

    if (!updatedOutlet) {
      throw new NotFoundException('Outlet not found');
    }

    return updatedOutlet;
  }

  async remove(id: string): Promise<void> {
    const result = await this.outletModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Outlet not found');
    }
  }

  async findByRestaurant(restaurantId: string): Promise<Outlet[]> {
    return this.outletModel.find({ restaurantId, isActive: true }).exec();
  }

  async updateStatus(id: string, status: string): Promise<Outlet> {
    const outlet = await this.outletModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    return outlet;
  }

  async updateTiming(id: string, timing: any): Promise<Outlet> {
    const outlet = await this.outletModel
      .findByIdAndUpdate(id, { timing }, { new: true })
      .exec();

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    return outlet;
  }

  async getOutletStats(outletId: string): Promise<any> {
    const outlet = await this.outletModel.findById(outletId).exec();
    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    // Here you can integrate with order-service to get actual statistics
    return {
      outletId: outlet._id,
      name: outlet.name,
      status: outlet.status,
      timing: outlet.timing,
      facilities: outlet.facilities,
      // Add more stats as needed from other services
    };
  }
}
