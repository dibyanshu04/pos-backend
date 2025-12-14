import { Injectable } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './schema/area.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OutletsService } from 'src/outlets/outlets.service';

@Injectable()
export class AreaService {
  constructor(
    @InjectModel(Area.name) private areaModel: Model<Area>,
    private readonly outletService: OutletsService,
  ) {}

  async create(createAreaDto: CreateAreaDto) {
    const exists = await this.areaModel.findOne({
      name: createAreaDto.name,
      outletId: createAreaDto.outletId,
      isDeleted: false,
    });

    if (exists) {
      throw new Error('An area with this name already exists in this outlet');
    }
    return await this.areaModel.create(createAreaDto);
  }

  // src/areas/areas.service.ts
  async findAllWithTables(outletId: string) {
    return this.areaModel.aggregate([
      // 1. MATCH: Matches exactly how your .find() does (String matching String)
      {
        $match: {
          outletId,
          isDeleted: false,
        },
      },
      {
        $addFields: {
          areaIdString: { $toString: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'tables',
          localField: 'areaIdString',
          foreignField: 'areaId',
          pipeline: [{ $match: { isDeleted: false } }],
          as: 'tables',
        },
      },

      // 3. Optional: Sort alphabetically
      { $sort: { name: 1 } },
    ]);
  }
  findAll() {
    const areas = this.areaModel.find({ isDeleted: false });
  }

  findOne(id: number) {
    return `This action returns a #${id} area`;
  }

  update(id: number, updateAreaDto: UpdateAreaDto) {
    return `This action updates a #${id} area`;
  }

  remove(id: number) {
    return `This action removes a #${id} area`;
  }
}
