import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PaginationDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Number of elements which should be taken',
  })
  take: number;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Number of elements which should be skipped',
  })
  skip: number;
}
