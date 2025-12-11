import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If response is already formatted, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode || 200;

        let message = 'Success';

        // Custom messages based on HTTP method
        const request = ctx.getRequest();
        switch (request.method) {
          case 'POST':
            message = 'Resource created successfully';
            break;
          case 'PUT':
          case 'PATCH':
            message = 'Resource updated successfully';
            break;
          case 'DELETE':
            message = 'Resource deleted successfully';
            break;
        }

        return new SuccessResponseDto(data, message);
      }),
    );
  }
}
