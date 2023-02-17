import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class WeekFilterDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Week to consider top nodes',
  })
  week: number;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Year to consider top nodes',
  })
  year: number;
}
