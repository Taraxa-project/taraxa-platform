import { ApiProperty } from '@nestjs/swagger';
import { Min } from 'class-validator';
import { DelegationDto } from './delegation.dto';

export class CreateDelegationDto extends DelegationDto {
  @Min(1000)
  @ApiProperty({
    minimum: 1000,
  })
  value: number;
}
