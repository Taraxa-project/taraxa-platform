import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsHexadecimal } from 'class-validator';

export class DelegationDto {
  @ApiProperty()
  node: number;

  @IsEthereumAddress()
  @ApiProperty()
  from: string;

  @IsHexadecimal()
  @ApiProperty()
  proof: string;
}
