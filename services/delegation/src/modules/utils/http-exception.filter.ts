//     const errorResponse = exception.getResponse();

//     response.status(status).json(
//
//         ? errorResponse
//         : {
//
//           },
//     );
//   }

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError } from 'typeorm';
import { ValidationException } from './exceptions/validation.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal server error';
    let errorResponse;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      error = exception.name;

      const res = exception.getResponse();
      if (typeof res === 'object') {
        errorResponse = res;
      } else {
        message = res;
      }
    }

    if (exception instanceof ValidationException) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Bad Request';
    }

    if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = exception.message;
      error = 'Not Found';
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    console.log(typeof exception);
    console.log(Object.keys(exception));

    response.status(statusCode).json(
      errorResponse ?? {
        statusCode,
        message,
        error,
      },
    );
  }
}
