import { ApiProperty } from '@nestjs/swagger';
import { PendingRewardDto } from './pending-reward.dto';

export class PendingRewardsDto {
  @ApiProperty({ type: [PendingRewardDto] })
  rewards: PendingRewardDto[];

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  validTotal: number;

  @ApiProperty({ type: Number })
  claimable: number;

  @ApiProperty({ type: Number })
  validClaimable: number;

  @ApiProperty({ type: Number })
  communityTotal: number;

  @ApiProperty({ type: Number })
  validCommunityTotal: number;

  @ApiProperty({ type: Number })
  delegationTotal: number;

  @ApiProperty({ type: Number })
  validDelegationTotal: number;
}
