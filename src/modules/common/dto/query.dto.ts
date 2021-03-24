import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'number',
    },
  })
  range: number[] = [0, 10];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
  })
  sort: string[] = [];

  @ApiProperty({
    type: 'object',
    items: {
      type: 'string',
    },
  })
  filter: { [key: string]: any } = {};
}
