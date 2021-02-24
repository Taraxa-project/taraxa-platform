import { Request, Response as ExpressResponse } from 'express';
import * as contentRange from 'content-range';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { CollectionResponse } from '../collection.response';

export interface Response<T> extends ExpressResponse {
  data: CollectionResponse<T>;
}

@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<T, T[]> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const request: Request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data: CollectionResponse<T>) => {
        const response: Response<T> = context.switchToHttp().getResponse();

        response.setHeader(
          'Content-Range',
          contentRange.format({
            unit: 'data',
            size: data.count,
          }),
        );

        return data.data;
      }),
    );
  }
}
