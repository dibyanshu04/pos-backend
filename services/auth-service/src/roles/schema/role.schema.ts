import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type RoleDocument = Role & Document;

export enum RoleScope {
  PLATFORM = 'platform',
  RESTAURANT = 'restaurant',
}

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: RoleScope,
    required: true,
  })
  scope: RoleScope;

  @Prop({ type: [String], required: true })
  permissions: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Restaurant',
    // required: function (this: Role) {
    //   return this.scope === RoleScope.RESTAURANT;
    // },
  })
  restaurantId?: Types.ObjectId;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
