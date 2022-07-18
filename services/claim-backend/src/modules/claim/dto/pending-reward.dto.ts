import { ApiProperty } from '@nestjs/swagger';

export class PendingRewardDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  newClaimable: number;

  @ApiProperty()
  newAvailableToBeClaimed: number;

  @ApiProperty()
  availableToBeClaimed: number;

  @ApiProperty()
  locked: number;

  @ApiProperty()
  claimed: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  invalidReason: string;
}
