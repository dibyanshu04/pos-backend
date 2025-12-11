import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument,  User} from './schema/user.schema'; 
import { Role, RoleDocument } from 'src/roles/schema/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(createUserDto: any): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
  async findByEmailWithAccess(email: string) {
    return this.userModel
      .findOne({ email })
      .lean()
      
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findSuperAdmin(): Promise<UserDocument | null> {
    const super_admin_role: any = await this.roleModel
      .findOne({ name: 'SUPER_ADMIN' })
      .exec();
    if (!super_admin_role) {
      return null;
    }
    const super_admin = await this.userModel
      .findOne({ platformRole: super_admin_role._id.toString() })
      .exec();
    if (!super_admin) {
      return null;
    }
    return super_admin;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        lastLogin: new Date(),
      })
      .exec();
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (user) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      let lockUntil;

      // Lock account after 5 failed attempts for 30 minutes
      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await this.userModel
        .findByIdAndUpdate(userId, {
          failedLoginAttempts: newFailedAttempts,
          lockUntil,
        })
        .exec();
    }
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        failedLoginAttempts: 0,
        lockUntil: null,
      })
      .exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        password: hashedPassword,
      })
      .exec();
  }

  async setPasswordResetToken(userId: string, token: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      })
      .exec();
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .exec();
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { status }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async addRestaurantAccess(
    userId: string,
    restaurantAccess: any,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $push: { restaurantAccess } }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRestaurantAccess(
    userId: string,
    accessId: string,
    updateData: any,
  ): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
          'restaurantAccess._id': accessId,
        },
        {
          $set: {
            'restaurantAccess.$': updateData,
          },
        },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User or restaurant access not found');
    }

    return user;
  }

  async findAllRestaurantUsers(restaurantId: string): Promise<User[]> {
    return this.userModel
      .find({
        userType: 'restaurant',
        'restaurantAccess.restaurantId': restaurantId,
        'restaurantAccess.isActive': true,
      })
      .exec();
  }

  async findAllPlatformUsers(): Promise<User[]> {
    return this.userModel.find({ userType: 'platform' }).exec();
  }
}
