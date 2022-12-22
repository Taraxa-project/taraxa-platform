import { ApiPropertyOptional } from "@nestjs/swagger";
import { RewardType } from "../reward-type.enum";

export class RewardQueryDto {
  @ApiPropertyOptional({
    enum: RewardType,
  })
  type?: RewardType;
  @ApiPropertyOptional()
  epoch?: number;
  @ApiPropertyOptional()
  user?: number;
  @ApiPropertyOptional()
  address?: string;
}
