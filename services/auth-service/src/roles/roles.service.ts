import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, RoleScope } from './schema/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) { }
  
  findByName(name: string) {
    return this.roleModel.findOne({ name }).exec();
  }

  findById(id: string) {
    return this.roleModel.findById(id).exec();
  }

  findAll() {
    return this.roleModel.find().exec();
  }

  findByScope(scope: RoleScope) {
    return this.roleModel.find({ scope }).exec();
  }

  create(dto: any) {
    return this.roleModel.create(dto);
  }

  update(id: string, dto: any) {
    return this.roleModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }
}
