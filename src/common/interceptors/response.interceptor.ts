import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

import { Response } from 'express';

import { statusCodes } from '../common/status-codes';

interface ApiResponse<T> {
  code: number;

  status: string;

  message: string;

  pagination: null;

  data: T;

  errors: null;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();

    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        let message = 'Success';

        let responseData = data;

        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          'data' in data
        ) {
          const responseBody = data as Record<string, unknown>;

          message = String(responseBody.message);

          responseData = responseBody.data as T;
        }

        const statusLabel =
          Object.values(statusCodes).find(
            (item) => item.code === response.statusCode,
          )?.message ?? 'OK';

        return {
          code: response.statusCode,

          status: statusLabel,

          message,

          pagination: null,

          data: responseData,

          errors: null,
        };
      }),
    );
  }
}
