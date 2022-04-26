import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BatchTypes } from '../type/batch-type';

export class CreateBatchDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(BatchTypes)
  @ApiProperty({
    enum: BatchTypes,
  })
  type: BatchTypes;
}
