import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserType {
  PLATFORM = 'platform',
  RESTAURANT = 'restaurant',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({
    type: String,
    enum: UserType,
    required: true,
  })
  userType: UserType;

  // PLATFORM USER
  @Prop({
    type: Types.ObjectId,
    ref: 'Role',
    required: false,
  })
  platformRole?: Types.ObjectId;

  // RESTAURANT ACCESS
  @Prop({
    type: [
      {
        restaurantId: {
          type: Types.ObjectId,
          ref: 'Restaurant',
        },
        outletId: { type: Types.ObjectId, ref: 'Outlet' },
        roleId: {
          type: Types.ObjectId,
          ref: 'Role',
          required: true,
        },
        isActive: { type: Boolean, default: true },
      },
    ],
    default: [],
  })
  restaurantAccess: {
    restaurantId: Types.ObjectId;
    outletId?: Types.ObjectId;
    roleId: Types.ObjectId;
    isActive: boolean;
  }[];

  @Prop({
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Number, default: 0 })
  failedLoginAttempts: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
