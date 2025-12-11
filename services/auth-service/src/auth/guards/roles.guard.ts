import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ROLES_KEY,
  PERMISSIONS_KEY,
} from 'src/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredUserTypes =
      this.reflector.getAllAndOverride(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) || [];

    const requiredPermissions =
      this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) || [];

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    // USER TYPE CHECK
    if (
      requiredUserTypes.length &&
      !requiredUserTypes.includes(user.userType)
    ) {
      throw new ForbiddenException('User type not allowed');
    }
    if (user.permissions?.includes('*')) {
      return true;
    }
    // PERMISSION CHECK
    for (const permission of requiredPermissions) {
      if (!user.permissions?.includes(permission)) {
        throw new ForbiddenException(`Missing permission: ${permission}`);
      }
    }

    return true;
  }
}
