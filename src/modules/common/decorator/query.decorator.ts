import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { QueryDto } from '../dto/query.dto';

export const Query = createParamDecorator(
  (allowedFields: string[], request: Request) => {
    const q = request.query;
    const query = new QueryDto();

    try {
      query.range = JSON.parse(q['range'].toString());
    } catch (e) {
      query.range = [0, 9];
    }

    try {
      query.sort = JSON.parse(q['sort'].toString());
    } catch (e) {
      query.sort = ['id', 'ASC'];
    }

    if (!allowedFields.includes(query.sort[0])) {
      query.sort = ['id', 'ASC'];
    }

    let filter = {};

    try {
      filter = JSON.parse(q['filter'].toString());
    } catch (e) {
      filter = {};
    }

    for(const name of Object.keys(filter)) {
      if (allowedFields.includes(name)) {
        query.filter[name] = filter[name];
      }
    }

    return query;
  },
);
