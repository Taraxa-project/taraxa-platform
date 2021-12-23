import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  website: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  social: string;
}
