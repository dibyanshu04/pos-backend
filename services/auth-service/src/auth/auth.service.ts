import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterPlatformUserDto } from './dto/register-platform-user.dto';
import { RegisterRestaurantUserDto } from './dto/register-restaurant-user.dto';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';
import { UserType } from 'src/users/schema/user.schema';
import { RoleScope } from 'src/roles/schema/role.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    userType: string,
  ): Promise<any> {
    const user: any = await this.usersService.findByEmailWithAccess(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.userType !== userType) {
      throw new UnauthorizedException('Invalid user type');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new UnauthorizedException(
        'Account is temporarily locked due to too many failed attempts',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this.usersService.incrementFailedLoginAttempts(user._id.toString());
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.resetFailedLoginAttempts(user._id.toString());

    const { password: _, ...result } = user;
    return result;
  }

  private async buildUserAuthPayload(user: any) {
    // PLATFORM ROLE
    let platformRolePayload: any = null;
    let platformPermissions: string[] = [];

    if (user.userType === UserType.PLATFORM && user.platformRole) {
      const roleDoc = await this.rolesService.findById(
        user.platformRole.toString(),
      );
      if (
        roleDoc &&
        roleDoc.isActive &&
        roleDoc.scope === RoleScope.PLATFORM &&
        roleDoc._id
      ) {
        platformRolePayload = {
          id: roleDoc._id.toString(),
          name: roleDoc.name,
          permissions: roleDoc.permissions,
        };
        platformPermissions = roleDoc.permissions;
      }
    }

    // RESTAURANT ACCESS ROLES
    const restaurantAccessPayload: any[] = [];
    const restaurantPermissionSet = new Set<string>();
    if (Array.isArray(user.restaurantAccess)) {
      for (const access of user.restaurantAccess) {
        if (!access.isActive) continue;
        
        const roleDoc = await this.rolesService.findById(
          access.roleId.toString(),
        );
        if (
          !roleDoc ||
          !roleDoc.isActive ||
          roleDoc.scope !== RoleScope.RESTAURANT ||
          !roleDoc._id
        ) {
          console.error('Invalid roleId in restaurantAccess:', access.roleId);
          continue;
        }

        if (roleDoc.permissions.includes('*')) {
          restaurantPermissionSet.add('*');
        } else {
          roleDoc.permissions.forEach((p) => restaurantPermissionSet.add(p));
        }
        restaurantAccessPayload.push({
          restaurantId: access.restaurantId?.toString(),
          outletId: access.outletId?.toString() || null,
          role: {
            id: roleDoc._id.toString(),
            name: roleDoc.name,
            permissions: roleDoc.permissions,
          },
          isActive: access.isActive,
        });
      }
    }

    const restaurantPermissions = Array.from(restaurantPermissionSet);
    const allPermissions = Array.from(
      new Set([...platformPermissions, ...restaurantPermissions]),
    );

    const baseUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      userType: user.userType,
    };

    const jwtPayload = {
      sub: baseUser.id,
      email: baseUser.email, 
      userType: baseUser.userType,
      permissions: allPermissions,
      platformRole: platformRolePayload,
      restaurantAccess: restaurantAccessPayload,
    };
    const responseUser = {
      ...baseUser,
      platformRole: platformRolePayload,
      restaurantAccess: restaurantAccessPayload,
      permissions: allPermissions,
    };

    return { jwtPayload, responseUser };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.userType,
    );

    const { jwtPayload, responseUser } = await this.buildUserAuthPayload(user);

    return {
      access_token: this.jwtService.sign(jwtPayload),
      refresh_token: this.jwtService.sign(jwtPayload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
      user: responseUser,
    };
  }

  async registerPlatformUser(registerDto: RegisterPlatformUserDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Ensure role is a valid active PLATFORM role
    const role = await this.rolesService.findById(registerDto.roleId);
    if (!role || !role.isActive || role.scope !== RoleScope.PLATFORM) {
      throw new BadRequestException('Invalid platform role');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user: any = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      phone: registerDto.phone,
      password: hashedPassword,
      userType: UserType.PLATFORM,
      platformRole: role._id,
      status: 'active',
    });

    const { password: _, ...result } = user.toObject();
    return {
      message: 'Platform user registered successfully',
      user: result,
    };
  }

  async registerRestaurantUser(registerDto: RegisterRestaurantUserDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // restaurantAccess MUST have at least 1 entry
    const access = registerDto.restaurantAccess?.[0];
    if (!access) {
      throw new BadRequestException('Restaurant access data is missing');
    }

    // Validate role
    const role = await this.rolesService.findById(access.roleId);
    if (!role || !role.isActive || role.scope !== RoleScope.RESTAURANT) {
      throw new BadRequestException('Invalid restaurant role');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user: any = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      phone: registerDto.phone,
      password: hashedPassword,
      userType: UserType.RESTAURANT,
      status: 'pending',

      restaurantAccess: registerDto.restaurantAccess.map((ra) => ({
        restaurantId: ra.restaurantId,
        outletId: ra.outletId || null,
        roleId: ra.roleId,
        isActive: true,
      })),
    });

    const { password: _, ...result } = user.toObject();

    return {
      message: 'Restaurant user registered successfully. Waiting for approval.',
      user: result,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user: any = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { jwtPayload } = await this.buildUserAuthPayload(user);

      return {
        access_token: this.jwtService.sign(jwtPayload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user: any = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return {
      message: 'Password changed successfully',
    };
  }

  async requestPasswordReset(email: string) {
    const user: any = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user._id },
      { expiresIn: '1h' },
    );

    await this.usersService.setPasswordResetToken(
      user._id.toString(),
      resetToken,
    );

    // TODO: send email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user: any = await this.usersService.findById(payload.sub);

      if (!user || user.resetPasswordToken !== token) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await this.usersService.updatePassword(
        user._id.toString(),
        hashedPassword,
      );
      await this.usersService.clearPasswordResetToken(user._id.toString());

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}
