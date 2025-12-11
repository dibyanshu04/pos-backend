import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RestaurantAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRestaurantId = this.reflector.get<string>(
      'restaurantId',
      context.getHandler(),
    );

    const requiredOutletId = this.reflector.get<string>(
      'outletId',
      context.getHandler(),
    );

    if (!requiredRestaurantId) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user, params, query, body } = request;

    if (user.userType === 'platform') {
      return true; // Platform users have access to all restaurants
    }

    // Extract restaurant ID from request
    const restaurantId =
      params.restaurantId ||
      query.restaurantId ||
      body.restaurantId ||
      requiredRestaurantId;

    // Check if user has access to this restaurant
    const hasRestaurantAccess = user.restaurantAccess.some(
      (access: any) => access.restaurantId === restaurantId && access.isActive,
    );

    if (!hasRestaurantAccess) {
      return false;
    }

    // Check outlet access if required
    if (requiredOutletId) {
      const outletId =
        params.outletId || query.outletId || body.outletId || requiredOutletId;

      const hasOutletAccess = user.restaurantAccess.some(
        (access: any) =>
          access.restaurantId === restaurantId &&
          (!access.outletId || access.outletId === outletId) &&
          access.isActive,
      );

      return hasOutletAccess;
    }

    return true;
  }
}
