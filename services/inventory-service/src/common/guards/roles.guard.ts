import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) || [];

    if (!requiredRoles.length) {
      return true; // No role restriction on this route
    }

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      if (process.env.BYPASS_AUTH === 'true') {
        return true;
      }
      throw new UnauthorizedException(
        'User not authenticated. Integrate auth-service JWT strategy.',
      );
    }

    const userRoles = new Set<string>(
      [
        user.role,
        user.userType,
        user.restaurantRole,
        ...(Array.isArray(user.roles) ? user.roles : []),
      ]
        .filter(Boolean)
        .map((role: string) => role.toUpperCase()),
    );

    const hasRole = requiredRoles.some((role) =>
      userRoles.has(role.toUpperCase()),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient role. Required: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

