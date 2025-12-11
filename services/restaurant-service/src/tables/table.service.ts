import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table, TableSchema } from './schema/table.schema';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TableService {
  constructor(@InjectModel(Table.name) private tableModel: Model<Table>) {}

  async create(dto: CreateTableDto) {
    const exists = await this.tableModel.findOne({
      tableNumber: dto.tableNumber,
      outletId: dto.outletId,
      isDeleted: false,
    });

    if (exists) {
      throw new Error('A table with this number already exists in this outlet');
    }

    return this.tableModel.create(dto);
  }

  async findAll(outletId: string) {
    return this.tableModel.find({
      outletId,
      isDeleted: false,
    });
  }

  async findOne(id: string) {
    const table = await this.tableModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!table) throw new NotFoundException('Table not found');

    return table;
  }

  async update(id: string, dto: UpdateTableDto) {
    const table = await this.tableModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: dto },
      { new: true },
    );

    if (!table) throw new NotFoundException('Table not found');

    return table;
  }

  async remove(id: string) {
    const table = await this.tableModel.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true },
    );

    if (!table) throw new NotFoundException('Table not found');

    return { message: 'Table deleted successfully' };
  }
}
