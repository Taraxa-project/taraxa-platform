import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsIn(['PRIVATE_SALE', 'PUBLIC_SALE', 'COMMUNITY_ACTIVITY'])
  @ApiProperty()
  type: 'PRIVATE_SALE' | 'PUBLIC_SALE' | 'COMMUNITY_ACTIVITY';
}
