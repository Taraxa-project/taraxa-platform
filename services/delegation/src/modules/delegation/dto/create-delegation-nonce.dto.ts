import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class CreateDelegationNonceDto {
  @IsEthereumAddress()
  @ApiProperty()
  from: string;

  @ApiProperty()
  node: number;
}
