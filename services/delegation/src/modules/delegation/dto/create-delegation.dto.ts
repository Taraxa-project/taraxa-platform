import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsHexadecimal, Min } from 'class-validator';

export class CreateDelegationDto {
  @ApiProperty()
  node: number;

  @IsEthereumAddress()
  @ApiProperty()
  from: string;

  @IsHexadecimal()
  @ApiProperty()
  proof: string;

  @Min(1)
  @ApiProperty({
    minimum: 1,
  })
  value: number;
}
