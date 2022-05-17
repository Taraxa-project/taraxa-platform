import { ApiProperty } from '@nestjs/swagger';
import { PendingRewardDto } from './pending-reward.dto';

export class PendingRewardsDto {
  @ApiProperty({ type: [PendingRewardDto] })
  rewards: PendingRewardDto[];

  @ApiProperty({ type: Number })
  totalValid: number;

  @ApiProperty({ type: Number })
  total: number;
}
