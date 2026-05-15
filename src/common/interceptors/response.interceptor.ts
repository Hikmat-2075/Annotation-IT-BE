import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the data already has success and message fields, return as is
        if (data && data.success !== undefined && data.message) {
          return data;
        }

        // Otherwise wrap it with our response format
        return {
          success: true,
          message: 'Success',
          data: data,
        };
      }),
    );
  }
}
