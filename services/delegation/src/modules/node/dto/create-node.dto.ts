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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NodeType } from '../node-type.enum';

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
  @ApiProperty()
  addressProof: string;

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
