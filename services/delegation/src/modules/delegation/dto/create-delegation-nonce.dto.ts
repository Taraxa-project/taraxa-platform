import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, Min } from 'class-validator';

export class CreateDelegationNonceDto {
  @IsEthereumAddress()
  @ApiProperty()
  from: string;

  @ApiProperty()
  node: number;
}
