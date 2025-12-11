import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user: any = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id.toString());

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      platformRole: user.platformRole,
      restaurantAccess: user.restaurantAccess,
      permissions: payload.permissions,
    };
  }

  private extractPermissions(user: any): string[] {
    if (user.userType === 'platform') {
      // Get permissions from platform role
      return this.getPlatformPermissions(user.platformRole);
    } else {
      // Get permissions from restaurant access
      return user.restaurantAccess
        .filter((access: any) => access.isActive)
        .flatMap((access: any) => access.permissions);
    }
  }

  private getPlatformPermissions(platformRole: string): string[] {
    const rolePermissions = {
      super_admin: ['all'],
      admin: [
        'user:read',
        'user:write',
        'user:delete',
        'restaurant:read',
        'restaurant:write',
        'restaurant:delete',
        'subscription:read',
        'subscription:write',
        'analytics:read',
        'settings:read',
        'settings:write',
      ],
      support: ['user:read', 'restaurant:read', 'subscription:read'],
      sales: [
        'restaurant:read',
        'restaurant:write',
        'subscription:read',
        'subscription:write',
      ],
      finance: ['subscription:read', 'analytics:read'],
    };

    return rolePermissions[platformRole] || [];
  }
}
