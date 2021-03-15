import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { FileUploadDto } from './file-upload.dto';

export class CreateBatchDto extends FileUploadDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsIn(['PRIVATE_SALE', 'PUBLIC_SALE', 'COMMUNITY_ACTIVITY'])
  @ApiProperty()
  type: 'PRIVATE_SALE' | 'PUBLIC_SALE' | 'COMMUNITY_ACTIVITY';
}
