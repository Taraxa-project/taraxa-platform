import { ApiProperty } from '@nestjs/swagger';

export class PendingRewardDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  current: number;

  @ApiProperty()
  claimed: number;

  @ApiProperty()
  locked: number;

  @ApiProperty()
  availableToBeClaimed: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  invalidReason: string;
}
