import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateBatchDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    type: 'boolean',
  })
  isDraft: boolean;
}
