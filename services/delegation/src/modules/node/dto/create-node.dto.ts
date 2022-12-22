import {
  IsString,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsEthereumAddress,
  IsHexadecimal,
  IsIP,
  ValidateIf,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NodeType } from "../node-type.enum";
import { StartsWith } from "../../utils/validators/StartsWith";
import { IsHexLen } from "../../utils/validators/IsHexLen";

export class CreateNodeDto {
  @IsEnum(NodeType)
  @ApiProperty({ enum: NodeType })
  type: NodeType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name: string;

  @IsEthereumAddress()
  @ApiProperty()
  address: string;

  @IsHexadecimal()
  @StartsWith("0x")
  @ApiProperty()
  addressProof: string;

  @IsHexadecimal()
  @StartsWith("0x")
  @IsHexLen(64)
  vrfKey: string;

  @ValidateIf((o) => o.type === NodeType.MAINNET)
  @Min(0)
  @Max(100)
  @ApiPropertyOptional({
    minimum: 0,
    maximum: 100,
    default: null,
  })
  commission: number | null;

  @IsOptional()
  @IsIP()
  @ApiPropertyOptional()
  ip: string;
}
