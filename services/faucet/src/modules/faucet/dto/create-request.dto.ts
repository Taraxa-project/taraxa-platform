import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import RequestLimit from '../types/RequestLimit.enum';

export class CreateRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsNotEmpty()
  @ApiProperty()
  ipv4: string;

  @IsNotEmpty()
  @IsEnum(RequestLimit)
  @ApiProperty({
    enum: RequestLimit,
  })
  amount: RequestLimit;

  @IsNotEmpty()
  @ApiProperty()
  timestamp: Date;
}
