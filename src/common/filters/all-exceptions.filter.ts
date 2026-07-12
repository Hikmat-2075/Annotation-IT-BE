import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { statusCodes } from '../constants';
import { buildApiResponse } from '../utils';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  errors?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'INTERNAL_SERVER_ERROR';
    let message: string | string[] = 'Internal server error';
    let errors: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const responseObj = exceptionResponse as ExceptionResponse;

        message = responseObj.message || message;
        errors = responseObj.errors || null;

        if (responseObj.error) {
          error = responseObj.error.toUpperCase().replace(/ /g, '_');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const statusLabel =
      Object.values(statusCodes).find((item) => item.code === status)
        ?.message || error;

    response
      .status(status)
      .json(buildApiResponse(status, statusLabel, message, null, errors));
  }
}
