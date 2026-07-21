import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponseDto } from '../dtos/api-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((result: any) => {
        let data: any;
        let message = 'Operation completed successfully';
        let meta: Record<string, any> | undefined;

        if (result instanceof ApiResponseDto) {
          data = result.data;
          message = result.message || message;
          meta = result.meta;
        } else if (
          result &&
          typeof result === 'object' &&
          !Array.isArray(result) &&
          'data' in result &&
          'meta' in result
        ) {
          // Handled paginated result returned directly from service { data: [...], meta: {...} }
          data = result.data;
          meta = result.meta;
          message = result.message || 'Resources retrieved successfully';
        } else if (
          result &&
          typeof result === 'object' &&
          !Array.isArray(result) &&
          'data' in result
        ) {
          data = result.data;
          message = result.message || message;
          meta = result.meta;
        } else {
          // Direct return (single resource object or array)
          data = result;
        }

        const formattedResponse: Record<string, any> = {
          success: true,
          statusCode: response.statusCode,
          message,
          data: data !== undefined ? data : null,
        };

        if (meta !== undefined && meta !== null) {
          formattedResponse.meta = meta;
        }

        formattedResponse.timestamp = new Date().toISOString();

        return formattedResponse;
      }),
    );
  }
}
