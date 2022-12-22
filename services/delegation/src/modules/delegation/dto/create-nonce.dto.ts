import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress } from "class-validator";

export class CreateNonceDto {
  @IsEthereumAddress()
  @ApiProperty()
  from: string;

  @ApiProperty()
  node: number;
}
