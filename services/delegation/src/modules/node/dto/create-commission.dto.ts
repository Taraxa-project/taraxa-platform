import { Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommissionDto {
  @Min(0)
  @Max(100)
  @ApiProperty({
    minimum: 0,
    maximum: 100,
  })
  commission: number;
}
