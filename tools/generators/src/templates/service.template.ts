import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { {{EntityName}}, {{EntityName}}Document } from './schema/{{moduleName}}.schema';
import { Create{{EntityName}}Dto } from './dto/create-{{moduleName}}.dto';
import { Update{{EntityName}}Dto } from './dto/update-{{moduleName}}.dto';

@Injectable()
export class {{ServiceClassName}} {
  constructor(
    @InjectModel({{EntityName}}.name) private {{modelInstanceName}}: Model<{{EntityName}}Document>,
  ) {}

  async create(create{{EntityName}}Dto: Create{{EntityName}}Dto): Promise<{{EntityName}}> {
    const created{{EntityName}} = new this.{{modelInstanceName}}(create{{EntityName}}Dto);
    return created{{EntityName}}.save();
  }

  async findAll({{#if hasRestaurantId}}restaurantId: string{{/if}}): Promise<{{EntityName}}[]> {
    {{#if hasRestaurantId}}
    return this.{{modelInstanceName}}
      .find({ restaurantId })
      {{#if hasRank}}
      .sort({ rank: 1 })
      {{/if}}
      .exec();
    {{else}}
    return this.{{modelInstanceName}}
      {{#if hasRank}}
      .find()
      .sort({ rank: 1 })
      {{else}}
      .find()
      {{/if}}
      .exec();
    {{/if}}
  }

  async findOne(id: string): Promise<{{EntityName}}> {
    const {{entityInstanceName}} = await this.{{modelInstanceName}}.findById(id).exec();
    if (!{{entityInstanceName}}) {
      throw new NotFoundException('{{EntityDisplayName}} not found');
    }
    return {{entityInstanceName}};
  }

  async update(id: string, update{{EntityName}}Dto: Update{{EntityName}}Dto): Promise<{{EntityName}}> {
    const updated{{EntityName}} = await this.{{modelInstanceName}}
      .findByIdAndUpdate(id, update{{EntityName}}Dto, { new: true })
      .exec();

    if (!updated{{EntityName}}) {
      throw new NotFoundException('{{EntityDisplayName}} not found');
    }

    return updated{{EntityName}};
  }

  async remove(id: string): Promise<void> {
    const result = await this.{{modelInstanceName}}.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('{{EntityDisplayName}} not found');
    }
  }
}

