import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class NodeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Address of the node',
  })
  address: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of PBFT blocks from this node',
  })
  pbftCount: number;
}
