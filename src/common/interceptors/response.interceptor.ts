import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { statusCodes } from '../constants';
import {
  ApiResponseBody,
  buildApiResponse,
  normalizeSuccessPayload,
} from '../utils';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseBody
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseBody> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (response.headersSent) {
          return data as ApiResponseBody;
        }

        const {
          message,
          data: responseData,
          pagination,
        } = normalizeSuccessPayload(data);
        const statusLabel =
          Object.values(statusCodes).find(
            (item) => item.code === response.statusCode,
          )?.message ?? 'OK';

        return buildApiResponse(
          response.statusCode,
          statusLabel,
          message,
          responseData,
          null,
          pagination,
        );
      }),
    );
  }
}
