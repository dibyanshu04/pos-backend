import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Lightweight JWT guard placeholder.
 * In production, replace with a proper passport JWT strategy wired to auth-service.
 * For now, we only verify that an authenticated user has been injected into the request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (process.env.BYPASS_AUTH === 'true') {
      return true;
    }

    if (!request.user) {
      throw new UnauthorizedException(
        'User not authenticated. Integrate auth-service JWT strategy.',
      );
    }

    return true;
  }
}

