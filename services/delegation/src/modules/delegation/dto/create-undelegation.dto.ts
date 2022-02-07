import { ApiProperty } from '@nestjs/swagger';
import { DelegationDto } from './delegation.dto';

export class CreateUndelegationDto extends DelegationDto {
  @ApiProperty()
  value: number;
}
